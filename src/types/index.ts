export interface TussCode {
  code: string;
  description: string;
}

export interface Product {
  productCode: string;
  planName: string;
  ansCode: string;
  ansRegisteredName: string;
  segment: string;
  classification: string;
  operatorCode: string;
  operatorName: string;
  status: string;
  apiProductCode: string;
  apiPlanCode: string;
}

export interface RawProduct {
  codProduto: string;
  planoProduto: string;
  planoANS: string;
  nomeRegistradoANS: string;
  segmentacao: string;
  classificacao: string;
  codOperadora: string;
  nomeOperadora: string;
  situacao: string;
  codProdutoAPI: string;
  codPlanoAPI: string;
}

export interface RawTussCode {
  codigo: string;
  descricao: string;
}

export type TabId = "search" | "my-plan" | "find-provider";
