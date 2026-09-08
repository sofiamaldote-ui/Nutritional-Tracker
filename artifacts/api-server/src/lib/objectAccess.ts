import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

export interface Solicitante {
  userId?: number;
  role?: 'nutricionista' | 'paciente';
  patientId?: number;
}

/**
 * Decide se o solicitante pode ler o arquivo em objectPath
 * ("/objects/uploads/xxx"). A regra vem inteira do banco:
 *
 * - nutricionista: le tudo
 * - paciente: le anexos e PDFs das proprias consultas, e publicacoes
 *   publicadas que sejam gerais, direcionadas a ela ou a um grupo dela
 * - sem sessao: apenas publicacoes gerais e publicadas
 *
 * Arquivo nao referenciado em nenhuma tabela e sempre negado.
 */
export async function podeLerObjeto(
  objectPath: string,
  quem: Solicitante,
): Promise<boolean> {
  if (!objectPath) {
    return false;
  }

  if (quem.role === 'nutricionista') {
    return true;
  }

  const publicacaoGeral = await db.execute(sql`
    select 1
      from publications
     where status = 'publicado'
       and visibility = 'geral'
       and (pdf_path = ${objectPath} or image_path = ${objectPath})
     limit 1
  `);
  if (publicacaoGeral.rows.length > 0) {
    return true;
  }

  const patientId = quem.patientId;
  if (!patientId) {
    return false;
  }

  const daPaciente = await db.execute(sql`
    select 1
      from consultation_attachments a
      join consultations c on c.id = a.consultation_id
     where c.patient_id = ${patientId}
       and a.file_path = ${objectPath}
     limit 1
  `);
  if (daPaciente.rows.length > 0) {
    return true;
  }

  const daConsulta = await db.execute(sql`
    select 1
      from consultations
     where patient_id = ${patientId}
       and (bioimpedance_pdf_path = ${objectPath} or menu_pdf_path = ${objectPath})
     limit 1
  `);
  if (daConsulta.rows.length > 0) {
    return true;
  }

  const publicacaoDirigida = await db.execute(sql`
    select 1
      from publications p
     where p.status = 'publicado'
       and (p.pdf_path = ${objectPath} or p.image_path = ${objectPath})
       and (
         exists (
           select 1 from publication_patients pp
            where pp.publication_id = p.id
              and pp.patient_id = ${patientId}
         )
         or exists (
           select 1
             from publication_groups pg
             join patient_groups patg on patg.group_id = pg.group_id
            where pg.publication_id = p.id
              and patg.patient_id = ${patientId}
         )
       )
     limit 1
  `);

  return publicacaoDirigida.rows.length > 0;
}