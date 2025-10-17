'use client';

import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { memo } from 'react';

import type { TProduct } from '../model/products.schemas';

type Props = {
  product: TProduct;
  onEdit?: (product: TProduct) => void;
  onDelete?: (product: TProduct) => void;
};

export const ProductCard = memo(({ product, onEdit, onDelete }: Props) => {
  const t = useTranslations('products');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const formatter = useFormatter();
  const currency = locale === 'fr' ? 'EUR' : 'USD';
  const formattedPrice = formatter.number(product.price, {
    style: 'currency',
    currency,
  });
  const formattedInventory = formatter.number(product.inventory);
  const inventoryLabel = t('inventoryLabel', { count: formattedInventory });
  let statusLabel: string = product.status;
  try {
    statusLabel = t(`statusLabels.${product.status}`);
  } catch {
    // Fallback to raw status if translation is missing
  }

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
          <p className="text-sm text-slate-500">{inventoryLabel}</p>
        </div>
        <span className="text-sm text-slate-500">{statusLabel}</span>
      </header>
      <p className="text-2xl font-bold text-slate-900">{formattedPrice}</p>
      <footer className="flex items-center gap-3 text-sm">
        <button className="font-medium text-indigo-600" onClick={() => onEdit?.(product)} type="button">
          {commonT('edit')}
        </button>
        <button className="font-medium text-rose-600" onClick={() => onDelete?.(product)} type="button">
          {commonT('delete')}
        </button>
      </footer>
    </article>
  );
});
