from sqlalchemy import Column, Integer, String, DateTime, func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cod_produto = Column(String, nullable=False, index=True)
    plano_produto = Column(String, nullable=False)
    plano_ans = Column(String, nullable=False)
    nome_registrado_ans = Column(String, nullable=False)
    segmentacao = Column(String, nullable=False)
    classificacao = Column(String, nullable=False)
    cod_operadora = Column(String, nullable=False)
    nome_operadora = Column(String, nullable=False)
    situacao = Column(String, nullable=False)
    cod_produto_api = Column(String, nullable=False)
    cod_plano_api = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class TussCode(Base):
    __tablename__ = "tuss_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    codigo = Column(String, nullable=False, unique=True, index=True)
    descricao = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
