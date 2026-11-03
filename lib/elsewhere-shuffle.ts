import type { Slide } from './content';

export function orderedPhotos(photos: Slide[]): Slide[] {
  const ids =
    typeof window === 'undefined'
      ? undefined
      : (window as Window & { elsewhereOrder?: string[] }).elsewhereOrder;
  if (!ids || ids.length !== photos.length) return photos;
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  return ids.map((id) => byId.get(id)!).filter(Boolean);
}

export function shuffleScript(ids: string[]): string {
  return `(function(){var ids=${JSON.stringify(ids)};if(window.elsewhereOrder)return;var order=ids.slice();for(var i=order.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=order[i];order[i]=order[j];order[j]=t;}window.elsewhereOrder=order;var rules=order.map(function(id,slot){var row=Math.floor(slot/7),column=slot%7,count=Math.min(7,ids.length-row*7),offset=column-(count-1)/2,delta=row-Math.floor(ids.indexOf(id)/7);return '.fan-card[data-photo-id="'+id+'"]{left:calc(50% + var(--u) * '+(offset*80-68)+')!important;top:calc(var(--u)*24 + '+delta+' * (var(--u)*206 + 60px))!important;--fan-y:'+((0.6*offset*offset)/168*100)+'%!important;--fan-r:'+(offset*3)+'deg!important;--fan-i:'+column+'!important;}';}).join('');var style=document.createElement('style');style.id='elsewhere-shuffle-style';style.textContent=rules;document.head.appendChild(style);})();`;
}
