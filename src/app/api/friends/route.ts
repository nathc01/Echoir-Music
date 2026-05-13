import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get all friendships for the user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, image: true, role: true } }
      }
    });

    return NextResponse.json({ success: true, friendships });
  } catch (error) {
    console.error('Friends GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch friendships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, senderId, receiverId, friendshipId } = await request.json();

    if (action === 'request') {
      if (!senderId || !receiverId) return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
      
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        }
      });

      if (existing) {
        return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 });
      }

      const friendship = await prisma.friendship.create({
        data: { senderId, receiverId, status: 'PENDING' }
      });
      return NextResponse.json({ success: true, friendship });
    } 
    
    if (action === 'accept') {
      if (!friendshipId) return NextResponse.json({ error: 'Missing friendshipId' }, { status: 400 });
      const friendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'ACCEPTED' }
      });
      return NextResponse.json({ success: true, friendship });
    }

    if (action === 'reject' || action === 'remove') {
      if (!friendshipId) return NextResponse.json({ error: 'Missing friendshipId' }, { status: 400 });
      await prisma.friendship.delete({
        where: { id: friendshipId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Friends POST error:', error);
    return NextResponse.json({ error: 'Failed to process friendship action' }, { status: 500 });
  }
}
