import { NextResponse } from 'next/server'
import ImageKit from 'imagekit'
import { createClient } from '@/lib/supabase/server'
export async function GET(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Authentication required'},{status:401});if(!process.env.IMAGEKIT_PRIVATE_KEY||!process.env.IMAGEKIT_PUBLIC_KEY)return NextResponse.json({error:'ImageKit is not configured'},{status:503});const kit=new ImageKit({publicKey:process.env.IMAGEKIT_PUBLIC_KEY,privateKey:process.env.IMAGEKIT_PRIVATE_KEY,urlEndpoint:process.env.IMAGEKIT_URL_ENDPOINT||'https://ik.imagekit.io/sq7v8jwuc'});return NextResponse.json(kit.getAuthenticationParameters())}
