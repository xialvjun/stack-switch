import * as React from "react";
import { Switch, Route, withRouter, matchPath  } from 'react-router';
import * as PropTypes from 'prop-types';

import { match, RouteComponentProps, RouteProps } from 'react-router';
import { Location } from 'history';


interface LRM {
  loc: Location,
  route: RouteProps,
  match: match<any>
}

function dedup(loc_route_match_s: LRM[], compare_match: (m1: match<any>, m2: match<any>) => boolean) {
  return loc_route_match_s.reduce((acc: LRM[], lrm) => {
    const last = acc[acc.length - 1];
    if (last && last.route == lrm.route && compare_match(last.match, lrm.match)) {
      return acc.slice(0, -1).concat(lrm);
    }
    return acc.concat(lrm);
  }, []);
}

function match_route(loc: Location, routes: RouteProps[]): LRM {
  let match = null, index = -1;
  let routes_length = routes.length;
  while (!match && index < routes_length) {
    index += 1;
    match = matchPath(loc.pathname, routes[index]);
  }
  let route = routes[index];
  return { loc, route, match };
}

function location_is_equal(l1: Location, l2: Location): boolean {
  if (l1.key || l2.key) {
    return l1.key === l2.key;
  }
  return l1.pathname === l2.pathname && l1.search === l2.search && l1.hash === l2.hash && l1.state == l2.state;
}

export interface StackSwitchProps extends RouteComponentProps<any> {
  routes: RouteProps[]
  compare_match: (m1: match<any>, m2: match<any>) => boolean
  max_layer: number
  wrapper: React.ReactElement<any>
}

class CleanStackSwitch extends React.Component<StackSwitchProps, { lrms: LRM[] }> {
  routes: RouteProps[]
  constructor(props: StackSwitchProps) {
    super(props);
    this.routes = props.routes;
    const loc_route_match = match_route(props.location, this.routes);
    this.state = { lrms: [loc_route_match] };
  }
  componentWillReceiveProps(nextProps: StackSwitchProps) {
    const this_loc = this.props.location;
    const next_loc = nextProps.location;
    if (next_loc != this_loc) {
      const old_lrms = this.state.lrms;
      const lrm = match_route(next_loc, this.routes);

      const action = nextProps.history.action;
      if (action === 'PUSH') {
        this.setState({ lrms: old_lrms.concat(lrm) });
      } else if (action === 'POP') {
        const pop_to_lrm = old_lrms.slice().reverse().find(lrm => location_is_equal(lrm.loc, next_loc));
        this.setState({ lrms: old_lrms.slice(0, old_lrms.indexOf(pop_to_lrm)).concat(lrm) });
      } else if (action === 'REPLACE') {
        this.setState({ lrms: old_lrms.slice(0, -1).concat(lrm) });
      }
    }
  }
  render() {
    const { compare_match, max_layer } = this.props;
    const { lrms } = this.state;
    const to_render_lrms = dedup(lrms, compare_match).slice(0 - max_layer);
    const will_render = to_render_lrms.map((lrm: LRM, idx) => <Route key={idx} {...lrm.route} location={lrm.loc}/>);

    let { wrapper } = this.props;
    if (!wrapper && !React.Fragment) {
      wrapper = <div></div>
    }
    if (!wrapper) {
      return will_render
    }
    return React.cloneElement(wrapper, null, ...will_render);
  }
  static propTypes = {
    routes: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    compare_match: PropTypes.func.isRequired,
    max_layer: PropTypes.number.isRequired,
    wrapper: PropTypes.element,
  }
  static defaultProps = {
    compare_match: (m1: match<any>, m2: match<any>) => m1.url === m2.url,
    max_layer: 5,
  }
}


export const StackSwitch = withRouter(CleanStackSwitch);
export default StackSwitch;