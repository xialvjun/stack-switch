"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_router_1 = require("react-router");
// 这是在 render 期把 从 /a 到 /a/b 的 push 里的 /a 给过滤掉
// 不能根据 lrm.route 判断，因为 /a/01 /a/02 的 route 是相同的
function dedup(loc_route_match_key_s) {
    return loc_route_match_key_s.reduce(function (acc, lrmk) {
        var last = acc[acc.length - 1];
        if (last && last.key == lrmk.key) {
            return acc.slice(0, -1).concat(lrmk);
        }
        return acc.concat(lrmk);
    }, []);
}
function default_get_key(lrm) {
    return lrm.match.url;
}
function match_route(loc, routes, get_key) {
    var match = null, route = null;
    for (var index in routes) {
        route = routes[index];
        match = react_router_1.matchPath(loc.pathname, route);
        if (match) {
            break;
        }
    }
    var lrm = { loc: loc, route: route, match: match };
    var key = get_key(lrm);
    return __assign({}, lrm, { key: key });
}
function location_is_equal(l1, l2) {
    if (l1 == l2) {
        return true;
    }
    // only BrowserRouter has key
    if (l1.key || l2.key) {
        return l1.key === l2.key;
    }
    return (l1.pathname === l2.pathname &&
        l1.search === l2.search &&
        l1.hash === l2.hash &&
        l1.state == l2.state);
}
var CleanStackSwitch = /** @class */ (function (_super) {
    __extends(CleanStackSwitch, _super);
    function CleanStackSwitch(props) {
        var _this = _super.call(this, props) || this;
        _this.routes = props.routes;
        var loc_route_match_key = match_route(props.location, _this.routes, props.get_key);
        _this.state = { lrmks: [loc_route_match_key] };
        return _this;
    }
    CleanStackSwitch.prototype.componentWillReceiveProps = function (nextProps) {
        var this_loc = this.props.location;
        var next_loc = nextProps.location;
        if (next_loc != this_loc) {
            var old_lrmks = this.state.lrmks;
            var lrm = match_route(next_loc, this.routes, nextProps.get_key);
            var action = nextProps.history.action;
            if (action === "PUSH") {
                this.setState({ lrmks: old_lrmks.concat(lrm) });
            }
            else if (action === "POP") {
                var pop_to_lrm = old_lrmks
                    .slice()
                    .reverse()
                    .find(function (lrm) { return location_is_equal(lrm.loc, next_loc); });
                this.setState({
                    lrmks: old_lrmks.slice(0, old_lrmks.indexOf(pop_to_lrm)).concat(lrm)
                });
            }
            else if (action === "REPLACE") {
                this.setState({ lrmks: old_lrmks.slice(0, -1).concat(lrm) });
            }
        }
    };
    CleanStackSwitch.prototype.render = function () {
        var max_layer = this.props.max_layer;
        var lrmks = this.state.lrmks;
        var to_render_lrmks = dedup(lrmks).slice(0 - max_layer);
        // <Route key> key 里要加入 lrmks.indexOf(lrm) 的原因是 history 可能是 ['/home', '/about', '/home'] ,没有连续相同，但有间断相同，dedup 函数是忽视间断相同的
        var will_render = to_render_lrmks.map(function (lrm, idx) { return (React.createElement(react_router_1.Route, __assign({}, lrm.route, { key: lrmks.indexOf(lrm) + ":" + lrm.key, location: lrm.loc }))); });
        var wrapper = this.props.wrapper;
        if (!wrapper && !React.Fragment) {
            wrapper = React.createElement("div", null);
        }
        if (!wrapper) {
            return will_render;
        }
        if (typeof wrapper === "function") {
            return wrapper(will_render);
        }
        return React.cloneElement(wrapper, null, will_render);
    };
    // static propTypes = {
    //   routes: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    //   get_key: PropTypes.func.isRequired,
    //   max_layer: PropTypes.number.isRequired,
    //   wrapper: PropTypes.element
    // };
    CleanStackSwitch.defaultProps = {
        get_key: default_get_key,
        max_layer: 5
    };
    return CleanStackSwitch;
}(React.Component));
exports.StackSwitch = react_router_1.withRouter(CleanStackSwitch);
