import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function buildSearchUrl(
  productCode: string,
  planCode: string
): string {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR");
  return `https://rederef-saude.appspot.com/rederef/buscaPrestadores?login=publico&canal=1&data=${encodeURIComponent(date)}&hora=${encodeURIComponent(time)}&tipoProduto=M&produto=${productCode}&plano=${planCode}`;
}

export function buildPortalUrl(
  productCode: string,
  planName: string
): string {
  return `https://portal.sulamericaseguros.com.br/main.jsp?lumPageId=8A488A0C15813A720115814200FE046B&lumChannelId=8A488A0C15813A72011581407CCF0168&lumRTI=sai.service.redereferenciada.detalhes_plano&lumRTSI=8A619BA6464E931F01465CE644FD3EAB&lumRCli=1&codTipoNegocio=S&codProduto=${productCode}&planoProduto=${encodeURIComponent(planName)}&codTipoContrato=&planoANSTipoContrato=`;
}
