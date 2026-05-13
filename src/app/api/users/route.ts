import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ success: true, users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true
      },
      take: 10
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Users search GET error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
