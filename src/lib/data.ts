import type { TussCode, Product, RawProduct, RawTussCode } from "@/types";
import rawProducts from "@/data/products.json";
import rawTuss from "@/data/tuss.json";

function mapRawProduct(raw: RawProduct): Product {
  return {
    productCode: raw.codProduto,
    planName: raw.planoProduto,
    ansCode: raw.planoANS,
    ansRegisteredName: raw.nomeRegistradoANS,
    segment: raw.segmentacao,
    classification: raw.classificacao,
    operatorCode: raw.codOperadora,
    operatorName: raw.nomeOperadora,
    status: raw.situacao,
    apiProductCode: raw.codProdutoAPI,
    apiPlanCode: raw.codPlanoAPI,
  };
}

function mapRawTussCode(raw: RawTussCode): TussCode {
  return {
    code: raw.codigo,
    description: raw.descricao,
  };
}

export const products: Product[] = (rawProducts as RawProduct[]).map(mapRawProduct);
export const tussCodes: TussCode[] = (rawTuss as RawTussCode[]).map(mapRawTussCode);
