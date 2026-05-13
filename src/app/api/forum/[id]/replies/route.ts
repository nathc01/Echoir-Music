import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { content, authorId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json({ error: 'Content and authorId are required.' }, { status: 400 });
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        authorId,
        threadId: id
      },
      include: {
        author: { select: { name: true, image: true, role: true } }
      }
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Forum reply POST error:', error);
    return NextResponse.json({ error: 'Failed to post reply.' }, { status: 500 });
  }
}
