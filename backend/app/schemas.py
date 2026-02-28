from datetime import datetime

from pydantic import BaseModel


class ProductOut(BaseModel):
    id: int
    cod_produto: str
    plano_produto: str
    plano_ans: str
    nome_registrado_ans: str
    segmentacao: str
    classificacao: str
    cod_operadora: str
    nome_operadora: str
    situacao: str
    cod_produto_api: str
    cod_plano_api: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ProductFrontend(BaseModel):
    """Matches the frontend Product interface for seamless integration."""

    productCode: str
    planName: str
    ansCode: str
    ansRegisteredName: str
    segment: str
    classification: str
    operatorCode: str
    operatorName: str
    status: str
    apiProductCode: str
    apiPlanCode: str


class TussCodeOut(BaseModel):
    id: int
    codigo: str
    descricao: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class TussCodeFrontend(BaseModel):
    """Matches the frontend TussCode interface."""

    code: str
    description: str


class PaginatedProducts(BaseModel):
    items: list[ProductFrontend]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginatedTussCodes(BaseModel):
    items: list[TussCodeFrontend]
    total: int
    page: int
    page_size: int
    total_pages: int


class StatsOut(BaseModel):
    total_products: int
    total_tuss_codes: int
    distinct_plans: int
    distinct_segments: int
