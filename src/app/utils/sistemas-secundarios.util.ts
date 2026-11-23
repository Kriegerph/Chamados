import { Chamado } from "../models/chamado.model";

export function getSistemasSecundarios(chamado: Chamado): string[] {
  const principal = chamado.contextoSistemaId?.trim();
  const relacionados = chamado.sistemasRelacionados ?? [];
  return [...new Set(relacionados.map((id) => id.trim()).filter((id) => id && id !== principal))];
}
