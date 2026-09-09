import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from '@workspace/api-zod';
import { Router, type IRouter, type Request, type Response } from 'express';

import { podeLerObjeto } from '../lib/objectAccess';
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from '../lib/objectStorage';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Devolve uma URL assinada para o cliente enviar o arquivo direto ao R2.
 * Apenas a nutricionista pode enviar arquivos.
 */
router.post(
  '/storage/uploads/request-url',
  async (req: Request, res: Response) => {
    if (req.session.role !== 'nutricionista') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
      const { name, size, contentType } = parsed.data;
      const { uploadURL, objectPath } =
        await objectStorageService.getObjectEntityUploadURL(contentType);

      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Entrega o arquivo pelo proprio servidor, apos checar a permissao no banco.
 * O R2 nunca fica acessivel diretamente pelo navegador.
 */
router.get('/storage/objects/*path', async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
    const objectPath = `/objects/${wildcardPath}`;

    const permitido = await podeLerObjeto(objectPath, {
      userId: req.session.userId,
      role: req.session.role,
      patientId: req.session.patientId,
    });

    if (!permitido) {
      res.status(req.session.userId ? 403 : 401).json({ error: 'Forbidden' });
      return;
    }

    const objeto = await objectStorageService.getObjectStream(objectPath);

    res.setHeader('Content-Type', objeto.contentType);
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
    if (objeto.contentLength !== undefined) {
      res.setHeader('Content-Length', String(objeto.contentLength));
    }

    // ?download=1 (ou ?download=nome-do-arquivo.pdf) forca o navegador a
    // baixar em vez de abrir inline. Sem esse parametro o arquivo abre no
    // visualizador (iframe/aba nova).
    if (req.query.download !== undefined) {
      const bruto = Array.isArray(req.query.download)
        ? req.query.download[0]
        : req.query.download;
      const nome = String(bruto ?? '')
        .replace(/[^\w.\- ]+/g, '_')
        .trim();
      const nomeArquivo =
        nome && nome !== '1' ? nome : (wildcardPath.split('/').pop() ?? 'arquivo');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${nomeArquivo}"`,
      );
    }

    objeto.stream.on('error', (erro) => {
      req.log.error({ err: erro }, 'Error streaming object');
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to serve object' });
      } else {
        res.destroy();
      }
    });

    objeto.stream.pipe(res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, 'Object not found');
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    req.log.error({ err: error }, 'Error serving object');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;