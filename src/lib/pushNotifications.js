import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = 'BH5d0hYrox4Xg8NpteSyqqOg_2NT2ZHsOuhJTEG8YO39pen-31ZEons217JBVFEUaXygR2RZha-KHz1iu5GPq-o';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export async function subscribeToPush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied.');
  }

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: userId, subscription: subscription.toJSON() }, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
  return subscription;
}

export async function unsubscribeFromPush(userId) {
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();

  await supabase.from('push_subscriptions').delete().eq('user_id', userId);
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}