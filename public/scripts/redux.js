/*
 * Getting Started with Redux:
 *   https://egghead.io/courses/getting-started-with-redux
 */

const { combineReducers} = Redux;
const { Component } = React;
const { connect } = ReactRedux;
const { createStore } = Redux;
const { Provider } = ReactRedux;


/* Action creators - common pattern in Redux applications
 * -------------------------------------------------------------------------- */
let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text: text
  };
};

const setVisibilityFilters = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
};

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};


/* Link components
 * -------------------------------------------------------------------------- */
const Link = ({ active, children, onClick }) => {
  if (active) {
    return (<span>{children}</span>);
  }
  return (
    <a
      href='#'
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
      >
      {children}
    </a>
  );
};

const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
};

const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilters(ownProps.filter));
    }
  }
};

const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link);


/* Todo components
 * -------------------------------------------------------------------------- */
// Purely presentation component. Does not specify behavior.
const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration:
        completed ?
        'line-through' : 'none'
    }}
    >
    {text}
  </li>
);

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        onClick={() => onTodoClick(todo.id)}
        completed={todo.completed}
        text={todo.text}
      />
    )}
  </ul>
);

const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  };
};

const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id));
    }
  }
};

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
          t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
          t => !t.completed
      );
    default:
      return todos;
  }
};


/* AddTodo component
 * -------------------------------------------------------------------------- */

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node;}} />
      <button onClick={() => {
        dispatch(addTodo(input.value));
        input.value = '';
      }}>
        Add Todo
      </button>
    </div>
  );
};

// Not subscribing to the store. Just injecting dispatch function as a prop.
AddTodo = connect()(AddTodo);


/* Footer component
 * -------------------------------------------------------------------------- */
const Footer = () => {
  return (
    <p>
      Show:
      {' '}
      <FilterLink filter='SHOW_ALL'>All</FilterLink>
      {', '}
      <FilterLink filter='SHOW_ACTIVE'>Active</FilterLink>
      {', '}
      <FilterLink filter='SHOW_COMPLETED'>Completed</FilterLink>
    </p>
  );
};


/* Reducers
 * -------------------------------------------------------------------------- */

// Implementation of combineReducers
//
//const combineReducers = (reducers) => {
//  return (state = {}, action = {}) => {
//    return Object
//      .keys(reducers)
//      .reduce((nextState, key) => {
//        nextState[key] = reducers[key](state[key], action);
//        return nextState;
//      },
//      {}
//    );
//  };
//};

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      return Object.assign({}, state, {
        completed: !state.completed
      });
    default:
      return state;
  }
};

const todos = (state = [], action = {}) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const visibilityFilter = (state = 'SHOW_ALL', action = {}) => {
  switch(action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const todoApp = combineReducers({
  todos,
  visibilityFilter
});


/* Instantiate app
 * -------------------------------------------------------------------------- */

const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp  />
  </Provider>,
  document.getElementById('content')
);
