// Action Creator
export const changeView = view => {
  return {
    type: 'CHANGE_VIEW',
    view: view
  }
}

// Reducer
export const currentView = (state='UNIVERSE_VIEW', action) => {
  switch (action.type) {
    case 'CHANGE_VIEW':
      return action.view;
    default:
      return state;
  }
}
