import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Thread ID is required.' }, { status: 400 });
    }
    await prisma.thread.delete({ where: { id: String(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forum DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete thread.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const threads = await prisma.thread.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, threads });
  } catch (error) {
    console.error('Forum GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch threads.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, authorId } = await request.json();
    if (!title || !content || !authorId) {
      return NextResponse.json({ error: 'Title, content and author are required.' }, { status: 400 });
    }
    const thread = await prisma.thread.create({
      data: { title, content, category: category || 'General Discussion', authorId },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error('Forum POST error:', error);
    return NextResponse.json({ error: 'Failed to create thread.' }, { status: 500 });
  }
}
