export function buildVerifiedIdentityForm(form, userProfile) {
  if (Number(userProfile?.isRealnameAuth || 0) !== 1) {
    return form
  }

  return {
    ...form,
    realName: userProfile?.realName || form.realName,
    idCard: userProfile?.idCard || form.idCard,
  }
}
