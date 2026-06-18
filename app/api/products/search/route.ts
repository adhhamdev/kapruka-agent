import { NextRequest, NextResponse } from 'next/server';
import { AppError, ERROR_MESSAGES } from '@/lib/errors';
import { searchKaprukaProducts } from '@/lib/kapruka-search';
import { enrichKaprukaProducts } from '@/lib/kapruka-product-image';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw new AppError('INVALID_REQUEST', 400, 'Invalid JSON body');
    }

    const q = typeof body.q === 'string' ? body.q.trim() : '';
    if (q.length < 3) {
      throw new AppError('INVALID_REQUEST', 400, 'Search query must be at least 3 characters');
    }

    const result = await searchKaprukaProducts({
      q,
      category: typeof body.category === 'string' ? body.category : undefined,
      min_price: typeof body.min_price === 'number' ? body.min_price : undefined,
      max_price: typeof body.max_price === 'number' ? body.max_price : undefined,
      sort: typeof body.sort === 'string' ? body.sort : undefined,
      cursor: typeof body.cursor === 'string' ? body.cursor : undefined,
      limit: typeof body.limit === 'number' ? Math.min(body.limit, 20) : 10,
      in_stock_only: body.in_stock_only !== false,
    });

    const products = await enrichKaprukaProducts(result.products);

    return NextResponse.json({
      products,
      nextCursor: result.nextCursor,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    console.error('[POST api/products/search Error]:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC, code: 'GENERIC' },
      { status: 500 },
    );
  }
}
