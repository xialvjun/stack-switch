import * as React from "react";
import { Component, ComponentClass, ReactElement, ReactNode } from "react";
import { Switch, Route, withRouter, matchPath } from "react-router";
import { match, RouteComponentProps, RouteProps } from "react-router";
import { Location } from "history";

export interface LRM {
  loc: Location;
  route: RouteProps;
  match: match<any>;
}

interface LRMK extends LRM {
  key: string;
}

// 这是在 render 期把 从 /a 到 /a/b 的 push 里的 /a 给过滤掉
// 不能根据 lrm.route 判断，因为 /a/01 /a/02 的 route 是相同的
function dedup(loc_route_match_key_s: LRMK[]) {
  return loc_route_match_key_s.reduce((acc: LRMK[], lrmk) => {
    const last = acc[acc.length - 1];
    if (last && last.key == lrmk.key) {
      return acc.slice(0, -1).concat(lrmk);
    }
    return acc.concat(lrmk);
  }, []);
}

function default_get_key(lrm: LRM) {
  return lrm.match.url;
}

function match_route(
  loc: Location,
  routes: RouteProps[],
  get_key: (lrm: LRM) => string
): LRMK {
  let match = null,
    route = null;
  for (const index in routes) {
    route = routes[index];
    match = matchPath(loc.pathname, route);
    if (match) {
      break;
    }
  }
  const lrm: LRM = { loc, route, match };
  const key = get_key(lrm);
  return { ...lrm, key };
}

function location_is_equal(l1: Location, l2: Location): boolean {
  if (l1 == l2) {
    return true;
  }
  // only BrowserRouter has key
  if (l1.key || l2.key) {
    return l1.key === l2.key;
  }
  return (
    l1.pathname === l2.pathname &&
    l1.search === l2.search &&
    l1.hash === l2.hash &&
    l1.state == l2.state
  );
}

export interface StackSwitchProps extends RouteComponentProps<any> {
  routes: RouteProps[];
  get_key?: (loc_route_match: LRM) => string;
  max_layer?: number;
  wrapper?: ReactElement<any> | ((will_render: ReactNode[]) => ReactNode);
}

class CleanStackSwitch extends React.Component<
  StackSwitchProps,
  { lrmks: LRMK[] }
> {
  routes: RouteProps[];
  constructor(props: StackSwitchProps) {
    super(props);
    this.routes = props.routes;
    const loc_route_match_key = match_route(
      props.location,
      this.routes,
      props.get_key
    );
    this.state = { lrmks: [loc_route_match_key] };
  }
  componentWillReceiveProps(nextProps: StackSwitchProps) {
    const this_loc = this.props.location;
    const next_loc = nextProps.location;
    if (next_loc != this_loc) {
      const old_lrmks = this.state.lrmks;
      const lrm = match_route(next_loc, this.routes, nextProps.get_key);

      const action = nextProps.history.action;
      if (action === "PUSH") {
        this.setState({ lrmks: old_lrmks.concat(lrm) });
      } else if (action === "POP") {
        const pop_to_lrm = old_lrmks
          .slice()
          .reverse()
          .find(lrm => location_is_equal(lrm.loc, next_loc));
        this.setState({
          lrmks: old_lrmks.slice(0, old_lrmks.indexOf(pop_to_lrm)).concat(lrm)
        });
      } else if (action === "REPLACE") {
        this.setState({ lrmks: old_lrmks.slice(0, -1).concat(lrm) });
      }
    }
  }
  render() {
    const { max_layer } = this.props;
    const { lrmks } = this.state;
    const to_render_lrmks = dedup(lrmks).slice(0 - max_layer);
    // <Route key> key 里要加入 lrmks.indexOf(lrm) 的原因是 history 可能是 ['/home', '/about', '/home'] ,没有连续相同，但有间断相同，dedup 函数是忽视间断相同的
    const will_render = to_render_lrmks.map((lrm: LRMK, idx) => (
      <Route
        {...lrm.route}
        key={lrmks.indexOf(lrm) + ":" + lrm.key}
        location={lrm.loc}
      />
    ));

    let { wrapper } = this.props;
    if (!wrapper && !React.Fragment) {
      wrapper = <div />;
    }
    if (!wrapper) {
      return will_render;
    }
    if (typeof wrapper === "function") {
      return wrapper(will_render);
    }
    return React.cloneElement(wrapper, null, will_render);
  }
  // static propTypes = {
  //   routes: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  //   get_key: PropTypes.func.isRequired,
  //   max_layer: PropTypes.number.isRequired,
  //   wrapper: PropTypes.element
  // };
  static defaultProps = {
    get_key: default_get_key,
    max_layer: 5
  };
}

export const StackSwitch = withRouter(CleanStackSwitch);
