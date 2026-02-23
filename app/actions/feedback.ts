'use server';

import { createClient } from '@/lib/supabase/server';
import { APP_VERSION } from '@/lib/constants';
import { feedbackSchema } from '@/lib/validations';

const FEEDBACK_IMAGES_BUCKET = 'feedback-images';
const MAX_IMAGES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getExtension(file: File): string {
  const name = file.name ?? '';
  const dot = name.lastIndexOf('.');
  if (dot >= 0 && dot < name.length - 1) {
    return name.slice(dot).toLowerCase();
  }
  const mime = file.type ?? '';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/webp') return '.webp';
  return '.jpg';
}

export type SubmitFeedbackResult = { error?: string; submitted?: boolean };

export async function submitFeedback(
  _prev: unknown,
  formData: FormData
): Promise<SubmitFeedbackResult> {
  const rating = formData.get('rating');
  const friendly_score = formData.get('friendly_score');
  const retention_intent = formData.get('retention_intent');
  const category = formData.get('category');
  const message = formData.get('message');
  const pricing_score = formData.get('pricing_score');
  const nps_score = formData.get('nps_score');

  const parsed = feedbackSchema.safeParse({
    rating: rating != null ? Number(rating) : undefined,
    friendly_score: friendly_score != null ? Number(friendly_score) : undefined,
    retention_intent: retention_intent != null ? Number(retention_intent) : undefined,
    category: category ?? undefined,
    message: typeof message === 'string' ? message : undefined,
    pricing_score: pricing_score !== '' && pricing_score != null ? Number(pricing_score) : undefined,
    nps_score: nps_score !== '' && nps_score != null ? Number(nps_score) : undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? 'Invalid feedback. Please check your answers.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be signed in to submit feedback.' };
  }

  const imageUrls: string[] = [];
  const rawFiles = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (rawFiles.length > MAX_IMAGES) {
    return { error: `Please upload at most ${MAX_IMAGES} images.` };
  }
  for (const file of rawFiles) {
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
      return { error: 'Each image must be JPEG, PNG, GIF or WebP and under 5MB.' };
    }
    const ext = getExtension(file);
    const path = `${user.id}/${crypto.randomUUID()}${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(FEEDBACK_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      return { error: 'Failed to upload an image. Please try again.' };
    }
    const { data: urlData } = supabase.storage.from(FEEDBACK_IMAGES_BUCKET).getPublicUrl(path);
    imageUrls.push(urlData.publicUrl);
  }

  const { error } = await supabase.from('feedbacks').insert({
    profile_id: user.id,
    rating: parsed.data.rating,
    friendly_score: parsed.data.friendly_score,
    retention_intent: parsed.data.retention_intent,
    category: parsed.data.category,
    message: parsed.data.message || null,
    pricing_score: parsed.data.pricing_score ?? null,
    nps_score: parsed.data.nps_score ?? null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    page: 'settings',
    event: 'feedback_submit',
    app_version: APP_VERSION,
    platform: 'web',
    meta: {},
  });

  if (error) {
    return { error: 'Failed to save feedback. Please try again.' };
  }

  return { submitted: true };
}
