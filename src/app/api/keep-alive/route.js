import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // A lightweight query to keep the database active
    const { count, error } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive error:', error);
      return NextResponse.json({ error: 'Failed to query database' }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Database connection is active',
      count: count
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
