export function isForbiddenUsername(username: string): { forbidden: boolean; reason: string } {
  const normalized = username.toLowerCase().trim();

  const chilamChinese = ['张智霖', '張智霖'];
  for (const name of chilamChinese) {
    if (normalized.includes(name)) {
      return { forbidden: true, reason: '用户名不能包含艺人姓名' };
    }
  }

  if (normalized.includes('chilam')) {
    return { forbidden: true, reason: '用户名不能包含 Chilam' };
  }

  const alphanumOnly = normalized.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  if (alphanumOnly.includes('juliancheung') || alphanumOnly.includes('cheungjulian')) {
    return { forbidden: true, reason: '用户名不能包含 Julian Cheung' };
  }
  if (normalized.includes('julian') && normalized.includes('cheung')) {
    return { forbidden: true, reason: '用户名不能包含 Julian Cheung' };
  }

  return { forbidden: false, reason: '' };
}
