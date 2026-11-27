// All user-facing strings live here, keyed by feature (docs/02 section 8).
export const copy = {
  app: {
    name: 'Little by Little',
  },
  tabs: {
    list: 'List',
    plan: 'Plan',
    you: 'You',
  },
  list: {
    title: 'Your list',
    emptyTitle: 'Your list is empty',
    emptyBody: 'Add what you need and we will work out where to shop.',
  },
  plan: {
    title: 'Your plan',
    emptyTitle: 'No plan yet',
    emptyBody: 'Add a few items to your list, then choose Plan my shop.',
  },
  you: {
    title: 'You',
    emptyTitle: 'Nothing saved yet',
    emptyBody: 'Your savings, vouchers and preferences will show up here.',
  },
  errors: {
    boundaryTitle: 'Something went wrong',
    boundaryBody: 'Your list is saved. Try again.',
    retry: 'Try again',
  },
} as const;
