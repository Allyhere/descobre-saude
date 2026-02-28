import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, TussCode
from app.schemas import (
    PaginatedProducts,
    PaginatedTussCodes,
    ProductFrontend,
    StatsOut,
    TussCodeFrontend,
)

router = APIRouter(prefix="/api", tags=["providers"])


def _product_to_frontend(p: Product) -> ProductFrontend:
    return ProductFrontend(
        productCode=p.cod_produto,
        planName=p.plano_produto,
        ansCode=p.plano_ans,
        ansRegisteredName=p.nome_registrado_ans,
        segment=p.segmentacao,
        classification=p.classificacao,
        operatorCode=p.cod_operadora,
        operatorName=p.nome_operadora,
        status=p.situacao,
        apiProductCode=p.cod_produto_api,
        apiPlanCode=p.cod_plano_api,
    )


def _tuss_to_frontend(t: TussCode) -> TussCodeFrontend:
    return TussCodeFrontend(code=t.codigo, description=t.descricao)


@router.get("/products", response_model=PaginatedProducts)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    product_code: str | None = None,
    plan_name: str | None = None,
    segment: str | None = None,
    classification: str | None = None,
    status: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if product_code:
        query = query.filter(Product.cod_produto == product_code)
    if plan_name:
        query = query.filter(Product.plano_produto == plan_name)
    if segment:
        query = query.filter(Product.segmentacao == segment)
    if classification:
        query = query.filter(Product.classificacao == classification)
    if status:
        query = query.filter(Product.situacao == status)
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Product.cod_produto).like(search_term),
                func.lower(Product.plano_produto).like(search_term),
                func.lower(Product.nome_registrado_ans).like(search_term),
                func.lower(Product.plano_ans).like(search_term),
            )
        )

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    return PaginatedProducts(
        items=[_product_to_frontend(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/products/{product_id}", response_model=ProductFrontend)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_frontend(product)


@router.get("/tuss", response_model=PaginatedTussCodes)
def list_tuss_codes(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(TussCode)

    if search:
        search_term = search.strip()
        if search_term.isdigit():
            query = query.filter(TussCode.codigo.like(f"{search_term}%"))
        else:
            like_term = f"%{search_term.lower()}%"
            query = query.filter(
                or_(
                    TussCode.codigo.like(f"%{search_term}%"),
                    func.lower(TussCode.descricao).like(like_term),
                )
            )

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size
    tuss_codes = query.offset(offset).limit(page_size).all()

    return PaginatedTussCodes(
        items=[_tuss_to_frontend(t) for t in tuss_codes],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/tuss/{code}", response_model=TussCodeFrontend)
def get_tuss_code(code: str, db: Session = Depends(get_db)):
    tuss = db.query(TussCode).filter(TussCode.codigo == code).first()
    if not tuss:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="TUSS code not found")
    return _tuss_to_frontend(tuss)


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_tuss = db.query(func.count(TussCode.id)).scalar() or 0
    distinct_plans = (
        db.query(func.count(func.distinct(Product.plano_produto))).scalar() or 0
    )
    distinct_segments = (
        db.query(func.count(func.distinct(Product.segmentacao))).scalar() or 0
    )
    return StatsOut(
        total_products=total_products,
        total_tuss_codes=total_tuss,
        distinct_plans=distinct_plans,
        distinct_segments=distinct_segments,
    )


@router.get("/filters/product-codes", response_model=list[str])
def get_product_codes(db: Session = Depends(get_db)):
    results = (
        db.query(Product.cod_produto)
        .distinct()
        .order_by(Product.cod_produto)
        .all()
    )
    return [r[0] for r in results]


@router.get("/filters/plan-names", response_model=list[str])
def get_plan_names(db: Session = Depends(get_db)):
    results = (
        db.query(Product.plano_produto)
        .distinct()
        .order_by(Product.plano_produto)
        .all()
    )
    return [r[0] for r in results]


@router.get("/filters/segments", response_model=list[str])
def get_segments(db: Session = Depends(get_db)):
    results = (
        db.query(Product.segmentacao)
        .distinct()
        .order_by(Product.segmentacao)
        .all()
    )
    return [r[0] for r in results]


@router.get("/filters/classifications", response_model=list[str])
def get_classifications(db: Session = Depends(get_db)):
    results = (
        db.query(Product.classificacao)
        .distinct()
        .order_by(Product.classificacao)
        .all()
    )
    return [r[0] for r in results]


@router.get("/filters/statuses", response_model=list[str])
def get_statuses(db: Session = Depends(get_db)):
    results = (
        db.query(Product.situacao).distinct().order_by(Product.situacao).all()
    )
    return [r[0] for r in results]
