import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Increment views
    await prisma.thread.update({
      where: { id },
      data: { views: { increment: 1 } }
    }).catch(() => null);

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, image: true, role: true } },
        replies: {
          include: { author: { select: { name: true, image: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error('Forum detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch thread.' }, { status: 500 });
  }
}
