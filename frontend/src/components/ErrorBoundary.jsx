import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-lg mx-auto text-center">
          <h2 className="text-white font-bold text-lg">Map failed to load</h2>
          <p className="text-gray-400 mt-2">There was a problem displaying the map. You can still view tasks in the list.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
