import { memo } from 'react';

import type { TProduct } from '../model/products.schemas';

type Props = {
  product: TProduct;
  onEdit?: (product: TProduct) => void;
  onDelete?: (product: TProduct) => void;
};

export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
}: Props) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="text-sm text-slate-500">Inventory: {product.inventory}</p>
        </div>
        <span className="text-sm text-slate-500">{product.status}</span>
      </header>
      <p className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
      <footer className="flex items-center gap-3 text-sm">
        <button
          className="font-medium text-indigo-600"
          onClick={() => onEdit?.(product)}
          type="button"
        >
          Edit
        </button>
        <button
          className="font-medium text-rose-600"
          onClick={() => onDelete?.(product)}
          type="button"
        >
          Delete
        </button>
      </footer>
    </article>
  );
});
