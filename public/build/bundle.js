
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf$1 = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf$1(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf$1(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active$1 = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active$1 += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active$1 -= deleted;
            if (!active$1)
                clear_rules();
        }
    }
    function clear_rules() {
        raf$1(() => {
            if (active$1)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const HTMltagInfo = {
        "A": { "name": "Anchor", "iconURI": "./assets/icons/link.svg" },
        "BODY": { "name": "Document body", "iconURI": "./assets/icons/browser.svg" },
        "BUTTON": { "name": "Button", "iconURI": "./assets/icons/play-circle.svg" },
        "CANVAS": { "name": "Canvas", "iconURI": "./assets/icons/canvas.svg" },
        "DIV": { "name": "Division", "iconURI": "./assets/icons/grid.svg" },
        "H1": { "name": "Heading 1", "iconURI": "./assets/icons/heading.svg" },
        "H2": { "name": "Heading 2", "iconURI": "./assets/icons/heading.svg" },
        "H3": { "name": "Heading 3", "iconURI": "./assets/icons/heading.svg" },
        "H4": { "name": "Heading 4", "iconURI": "./assets/icons/heading.svg" },
        "H5": { "name": "Heading 5", "iconURI": "./assets/icons/heading.svg" },
        "H6": { "name": "Heading 6", "iconURI": "./assets/icons/heading.svg" },
        "HR": { "name": "Horizontal line", "iconURI": "./assets/icons/minus.svg" },
        "INPUT": { "name": "Input", "iconURI": "./assets/icons/globe.svg" },
        "LABEL": { "name": "Label", "iconURI": "./assets/icons/pricetags.svg" },
        "OL": { "name": "Organized list", "iconURI": "./assets/icons/list.svg" },
        "UL": { "name": "Unorganized list", "iconURI": "./assets/icons/menu.svg" },
        "PROGRESS": { "name": "Progress", "iconURI": "./assets/icons/clock.svg" },
        "P": { "name": "Paragraph", "iconURI": "./assets/icons/paragraph.svg" },
        "SECTION": { "name": "Paragraph", "iconURI": "./assets/icons/layout.svg" },
        "SPAN": { "name": "Span", "iconURI": "./assets/icons/flash.svg" },
        "TEXTAREA": { "name": "Textarea", "iconURI": "./assets/icons/edit-2.svg" },
    };
    let collection = writable([
        {
            type: "DIV",
            showing: false,
            styleOverrides: [{
                    name: "override 1"
                }]
        },
        {
            type: "SECTION",
            showing: false,
            styleOverrides: [{
                    name: "override 1"
                }, {
                    name: "override 2"
                }]
        },
        {
            type: "H1",
            showing: false,
        },
        {
            type: "CANVAS",
            showing: false,
            styleOverrides: [{
                    name: "override 1"
                }, {
                    name: "override 2"
                }, {
                    name: "override 3"
                }]
        },
        {
            type: "INPUT",
            showing: false,
            styleOverrides: [{
                    name: "override 1"
                }]
        },
        {
            type: "UL",
            showing: false,
            styleOverrides: [{
                    name: "override 1"
                }, {
                    name: "override 2"
                }, {
                    name: "override 3"
                }, {
                    name: "override 4"
                }, {
                    name: "override 5"
                }]
        }
    ]);

    /* src/comp/ctrlMenuItems/CollectionViewer/Element.svelte generated by Svelte v3.48.0 */
    const file$h = "src/comp/ctrlMenuItems/CollectionViewer/Element.svelte";

    function create_fragment$h(ctx) {
    	let main;
    	let div;
    	let img0;
    	let img0_src_value;
    	let img0_class_value;
    	let img0_title_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let p;
    	let t2_value = HTMltagInfo[/*tagType*/ ctx[0]].name + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/icons/arrow-ios-forward.svg")) attr_dev(img0, "src", img0_src_value);

    			attr_dev(img0, "class", img0_class_value = "" + (null_to_empty(/*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "showArrow"
    			: "") + " svelte-b2iulz"));

    			attr_dev(img0, "alt", "");

    			attr_dev(img0, "title", img0_title_value = /*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "collapse"
    			: "expand");

    			add_location(img0, file$h, 14, 8, 420);
    			attr_dev(div, "class", "svelte-b2iulz");
    			add_location(div, file$h, 13, 4, 384);
    			attr_dev(img1, "rel", "preload");
    			if (!src_url_equal(img1.src, img1_src_value = /*iconURI*/ ctx[4])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-b2iulz");
    			add_location(img1, file$h, 18, 4, 648);
    			attr_dev(p, "class", "svelte-b2iulz");
    			add_location(p, file$h, 19, 4, 693);
    			set_style(main, "min-height", /*height*/ ctx[2] + "px");
    			set_style(main, "min-width", /*width*/ ctx[3] + "px");
    			attr_dev(main, "class", "svelte-b2iulz");
    			add_location(main, file$h, 11, 0, 302);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, img0);
    			append_dev(main, t0);
    			append_dev(main, img1);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(p, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleShow*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$collection, elmntIndex*/ 34 && img0_class_value !== (img0_class_value = "" + (null_to_empty(/*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "showArrow"
    			: "") + " svelte-b2iulz"))) {
    				attr_dev(img0, "class", img0_class_value);
    			}

    			if (dirty & /*$collection, elmntIndex*/ 34 && img0_title_value !== (img0_title_value = /*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "collapse"
    			: "expand")) {
    				attr_dev(img0, "title", img0_title_value);
    			}

    			if (dirty & /*iconURI*/ 16 && !src_url_equal(img1.src, img1_src_value = /*iconURI*/ ctx[4])) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*tagType*/ 1 && t2_value !== (t2_value = HTMltagInfo[/*tagType*/ ctx[0]].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*height*/ 4) {
    				set_style(main, "min-height", /*height*/ ctx[2] + "px");
    			}

    			if (dirty & /*width*/ 8) {
    				set_style(main, "min-width", /*width*/ ctx[3] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $collection;
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(5, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Element', slots, []);
    	let { tagType } = $$props;
    	let { elmntIndex } = $$props;
    	let { height } = $$props;
    	let { width } = $$props;
    	let { iconURI } = $$props;

    	const toggleShow = () => {
    		set_store_value(collection, $collection[elmntIndex].showing = !$collection[elmntIndex].showing, $collection);
    	};

    	const writable_props = ['tagType', 'elmntIndex', 'height', 'width', 'iconURI'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Element> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tagType' in $$props) $$invalidate(0, tagType = $$props.tagType);
    		if ('elmntIndex' in $$props) $$invalidate(1, elmntIndex = $$props.elmntIndex);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('iconURI' in $$props) $$invalidate(4, iconURI = $$props.iconURI);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		HTMltagInfo,
    		tagType,
    		elmntIndex,
    		height,
    		width,
    		iconURI,
    		toggleShow,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('tagType' in $$props) $$invalidate(0, tagType = $$props.tagType);
    		if ('elmntIndex' in $$props) $$invalidate(1, elmntIndex = $$props.elmntIndex);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('iconURI' in $$props) $$invalidate(4, iconURI = $$props.iconURI);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tagType, elmntIndex, height, width, iconURI, $collection, toggleShow];
    }

    class Element extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			tagType: 0,
    			elmntIndex: 1,
    			height: 2,
    			width: 3,
    			iconURI: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Element",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tagType*/ ctx[0] === undefined && !('tagType' in props)) {
    			console.warn("<Element> was created without expected prop 'tagType'");
    		}

    		if (/*elmntIndex*/ ctx[1] === undefined && !('elmntIndex' in props)) {
    			console.warn("<Element> was created without expected prop 'elmntIndex'");
    		}

    		if (/*height*/ ctx[2] === undefined && !('height' in props)) {
    			console.warn("<Element> was created without expected prop 'height'");
    		}

    		if (/*width*/ ctx[3] === undefined && !('width' in props)) {
    			console.warn("<Element> was created without expected prop 'width'");
    		}

    		if (/*iconURI*/ ctx[4] === undefined && !('iconURI' in props)) {
    			console.warn("<Element> was created without expected prop 'iconURI'");
    		}
    	}

    	get tagType() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tagType(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elmntIndex() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elmntIndex(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconURI() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconURI(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Direction$1;
    (function (Direction) {
        Direction[Direction["Vertical"] = 0] = "Vertical";
        Direction[Direction["Horizontal"] = 1] = "Horizontal";
    })(Direction$1 || (Direction$1 = {}));
    var EventType$1;
    (function (EventType) {
        EventType[EventType["Programatic"] = 0] = "Programatic";
        EventType[EventType["User"] = 1] = "User";
    })(EventType$1 || (EventType$1 = {}));

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/comp/ctrlMenuItems/CollectionViewer/Override.svelte generated by Svelte v3.48.0 */
    const file$g = "src/comp/ctrlMenuItems/CollectionViewer/Override.svelte";

    function create_fragment$g(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t1;
    	let main_intro;

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*name*/ ctx[0]);
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/copy.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-19c19b8");
    			add_location(img, file$g, 7, 4, 206);
    			attr_dev(p, "class", "svelte-19c19b8");
    			add_location(p, file$g, 8, 4, 253);
    			set_style(main, "min-height", /*height*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-19c19b8");
    			add_location(main, file$g, 5, 0, 106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t0);
    			append_dev(main, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (dirty & /*height*/ 2) {
    				set_style(main, "min-height", /*height*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fly, { y: -10, duration: 300 });
    					main_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Override', slots, []);
    	let { name } = $$props;
    	let { height } = $$props;
    	const writable_props = ['name', 'height'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Override> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({ fly, name, height });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, height];
    }

    class Override extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { name: 0, height: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Override",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Override> was created without expected prop 'name'");
    		}

    		if (/*height*/ ctx[1] === undefined && !('height' in props)) {
    			console.warn("<Override> was created without expected prop 'height'");
    		}
    	}

    	get name() {
    		throw new Error("<Override>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Override>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Override>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Override>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenuItems/DragDropList/ComponentList.svelte generated by Svelte v3.48.0 */
    const file$f = "src/comp/ctrlMenuItems/DragDropList/ComponentList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[33] = list;
    	child_ctx[34] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    // (413:12) {#if !!_.styleOverrides}
    function create_if_block$3(ctx) {
    	let section;
    	let current;
    	let each_value_1 = /*_*/ ctx[32].styleOverrides;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "class", "overrideContainer");
    			add_location(section, file$f, 413, 16, 18394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$collection, layerHeight*/ 272) {
    				each_value_1 = /*_*/ ctx[32].styleOverrides;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(413:12) {#if !!_.styleOverrides}",
    		ctx
    	});

    	return block;
    }

    // (415:20) {#each _.styleOverrides as override}
    function create_each_block_1(ctx) {
    	let override;
    	let current;

    	override = new Override({
    			props: {
    				name: /*override*/ ctx[35].name,
    				height: /*layerHeight*/ ctx[4],
    				margin: 10
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(override.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(override, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const override_changes = {};
    			if (dirty[0] & /*$collection*/ 256) override_changes.name = /*override*/ ctx[35].name;
    			if (dirty[0] & /*layerHeight*/ 16) override_changes.height = /*layerHeight*/ ctx[4];
    			override.$set(override_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(override.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(override.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(override, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(415:20) {#each _.styleOverrides as override}",
    		ctx
    	});

    	return block;
    }

    // (400:1) {#each $collection as _, i (_.type)}
    function create_each_block$2(key_1, ctx) {
    	let div;
    	let element_1;
    	let t0;
    	let t1;
    	let div_data_dnd_dragging_value;
    	let div_class_value;
    	let div_id_value;
    	let i = /*i*/ ctx[34];
    	let current;
    	let mounted;
    	let dispose;

    	element_1 = new Element({
    			props: {
    				tagType: /*_*/ ctx[32].type,
    				elmntIndex: /*i*/ ctx[34],
    				height: /*layerHeight*/ ctx[4],
    				width: /*containerWidth*/ ctx[5] - 20,
    				iconURI: HTMltagInfo[/*_*/ ctx[32].type].iconURI
    			},
    			$$inline: true
    		});

    	let if_block = !!/*_*/ ctx[32].styleOverrides && create_if_block$3(ctx);
    	const assign_div = () => /*div_binding*/ ctx[18](div, i);
    	const unassign_div = () => /*div_binding*/ ctx[18](null, i);

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[19](/*i*/ ctx[34], ...args);
    	}

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[20](/*i*/ ctx[34], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(element_1.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div, "data-dnd-item", "");

    			attr_dev(div, "data-dnd-dragging", div_data_dnd_dragging_value = active?.sourceIndex === /*i*/ ctx[34] && active?.sourceZone.id === /*id*/ ctx[1] || /*$dragging*/ ctx[7] === null
    			? true
    			: undefined);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*itemClass*/ ctx[2]) + " svelte-1h8tpti"));
    			attr_dev(div, "id", div_id_value = `ce812145-67d2-440c-8fdd-510b909e7d8d-${/*i*/ ctx[34]}`);
    			attr_dev(div, "style", /*itemStyle*/ ctx[6]);
    			add_location(div, file$f, 400, 2, 17815);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(element_1, div, null);
    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);
    			assign_div();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "touchstart", touchstart_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const element_1_changes = {};
    			if (dirty[0] & /*$collection*/ 256) element_1_changes.tagType = /*_*/ ctx[32].type;
    			if (dirty[0] & /*$collection*/ 256) element_1_changes.elmntIndex = /*i*/ ctx[34];
    			if (dirty[0] & /*layerHeight*/ 16) element_1_changes.height = /*layerHeight*/ ctx[4];
    			if (dirty[0] & /*containerWidth*/ 32) element_1_changes.width = /*containerWidth*/ ctx[5] - 20;
    			if (dirty[0] & /*$collection*/ 256) element_1_changes.iconURI = HTMltagInfo[/*_*/ ctx[32].type].iconURI;
    			element_1.$set(element_1_changes);

    			if (!!/*_*/ ctx[32].styleOverrides) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*$collection*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*$collection, id, $dragging*/ 386 && div_data_dnd_dragging_value !== (div_data_dnd_dragging_value = active?.sourceIndex === /*i*/ ctx[34] && active?.sourceZone.id === /*id*/ ctx[1] || /*$dragging*/ ctx[7] === null
    			? true
    			: undefined)) {
    				attr_dev(div, "data-dnd-dragging", div_data_dnd_dragging_value);
    			}

    			if (!current || dirty[0] & /*itemClass*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(/*itemClass*/ ctx[2]) + " svelte-1h8tpti"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*$collection*/ 256 && div_id_value !== (div_id_value = `ce812145-67d2-440c-8fdd-510b909e7d8d-${/*i*/ ctx[34]}`)) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (!current || dirty[0] & /*itemStyle*/ 64) {
    				attr_dev(div, "style", /*itemStyle*/ ctx[6]);
    			}

    			if (i !== /*i*/ ctx[34]) {
    				unassign_div();
    				i = /*i*/ ctx[34];
    				assign_div();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(element_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(element_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(element_1);
    			if (if_block) if_block.d();
    			unassign_div();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(400:1) {#each $collection as _, i (_.type)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let each_value = /*$collection*/ ctx[8];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*_*/ ctx[32].type;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "data-dnd-zone", "");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*zoneClass*/ ctx[3]} ${/*dropzone*/ ctx[0].containerClass}`) + " svelte-1h8tpti"));
    			add_location(div, file$f, 398, 0, 17681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_1*/ ctx[21](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$collection, id, $dragging, itemClass, itemStyle, dropzone, onMouseDown, onTouchDown, layerHeight, containerWidth*/ 2039) {
    				each_value = /*$collection*/ ctx[8];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*zoneClass, dropzone*/ 9 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*zoneClass*/ ctx[3]} ${/*dropzone*/ ctx[0].containerClass}`) + " svelte-1h8tpti"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div_binding_1*/ ctx[21](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ZONE_ATTR = 'data-dnd-zone';
    const ZONE_SELECTOR = `[${ZONE_ATTR}]`;
    const HANDLE_SELECTOR = '[data-dnd-handle]';
    const DRAG_TOLERANCE = 5; //px
    const dropzones = new Array();
    let click = undefined;
    let active = undefined;
    let raf; // animation frame
    const dragging = writable(undefined);

    function findDropZone(x, y) {
    	const el = document.elementFromPoint(x, y)?.closest(ZONE_SELECTOR); // this code uses the document element from point, which means that it will work even with different heights on elements, and we can vary the element height as we need.
    	return el ? dropzones.find(dz => dz.el === el) : undefined;
    } // const els = document.elementsFromPoint(x, y);
    // const el = els.find(e => e.getAttribute('data-dnd-zone') !== null);

    function instance$f($$self, $$props, $$invalidate) {
    	let itemStyle;
    	let $dragging;
    	let $collection;
    	validate_store(dragging, 'dragging');
    	component_subscribe($$self, dragging, $$value => $$invalidate(7, $dragging = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(8, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ComponentList', slots, []);
    	let { id } = $$props;
    	let { itemCount } = $$props;
    	let { itemSize } = $$props;
    	let { type } = $$props;
    	let { priority = 1 } = $$props;
    	let { itemClass = '' } = $$props;
    	let { zoneClass = '' } = $$props;
    	let { keyFn = i => i } = $$props;
    	let { useHandle = false } = $$props;
    	const dropzone = new type(id, priority, itemCount, itemSize);
    	let { layerHeight = 0 } = $$props;
    	let { containerWidth = 0 } = $$props;
    	const dispatch = createEventDispatcher();
    	let items = new Array(itemCount);

    	onMount(() => {
    		dropzone.styleContainerBaseStyle();
    		dropzones.push(dropzone);
    		dropzones.sort((a, b) => b.priority - a.priority);

    		return () => {
    			dropzones.splice(dropzones.findIndex(dz => dz === dropzone), 1);
    		};
    	});

    	// return el !== undefined ? dropzones.find(dz => dz.el === el) : undefined;
    	function onMouseDown(e, index) {
    		if (e.button !== 0 || useHandle && e.target.closest(HANDLE_SELECTOR) === null) {
    			return;
    		}

    		document.addEventListener('mousemove', onMouseDrag);
    		document.addEventListener('mouseup', onMouseDragEnd);
    		onDown({ pageX: e.pageX, pageY: e.pageY }, index);
    	}

    	function onTouchDown(e, index) {
    		if (useHandle && e.target.closest(HANDLE_SELECTOR) === null) {
    			return;
    		}

    		document.addEventListener('touchmove', onTouchDrag);
    		document.addEventListener('touchend', onTouchDragEnd);

    		onDown(
    			{
    				pageX: e.touches[0].pageX,
    				pageY: e.touches[0].pageY
    			},
    			index
    		);
    	}

    	function onDown({ pageX, pageY }, index) {
    		const el = dropzone.items[index];
    		const br = el.getBoundingClientRect();

    		click = {
    			el,
    			initPageX: pageX,
    			initPageY: pageY,
    			sourceIndex: index,
    			dragLeft: pageX - br.left,
    			dragTop: pageY - br.top,
    			sourceZone: dropzone
    		};
    	}

    	function onMouseDrag(e) {
    		onDrag(e);
    	}

    	function onTouchDrag(e) {
    		onDrag({
    			pageX: e.touches[0].pageX,
    			pageY: e.touches[0].pageY
    		});
    	}

    	function onDrag({ pageX, pageY }) {
    		if (active === undefined && (Math.abs(pageX - click.initPageX) > DRAG_TOLERANCE || Math.abs(pageY - click.initPageY) > DRAG_TOLERANCE)) {
    			if (active) {
    				finalizeDrag();
    			}

    			const placeholder = document.createElement('div');
    			placeholder.style.cssText = dropzone.placeholderStyleStr();
    			placeholder.setAttribute('data-dnd-placeholder', '');
    			dropzone.el.appendChild(placeholder);

    			active = {
    				type: EventType$1.User,
    				el: click.el,
    				placeholder,
    				resetZones: new Set([dropzone]),
    				sourceIndex: click.sourceIndex,
    				hoverIndex: undefined,
    				sourceZone: click.sourceZone,
    				destZone: dropzone,
    				dragLeft: click.dragLeft,
    				dragTop: click.dragTop,
    				onMoveResolve: undefined
    			};

    			set_store_value(dragging, $dragging = active, $dragging); // reactive value
    			click = undefined;
    			document.body.style.cursor = 'grabbing';
    		}

    		if (active) {
    			if (raf) cancelAnimationFrame(raf);

    			raf = requestAnimationFrame(() => {
    				raf = undefined;
    				const drag = active;
    				const { el, sourceZone, sourceIndex, dragLeft, dragTop } = drag;
    				const tx = pageX - dragLeft;
    				const ty = pageY - dragTop;
    				let dest = findDropZone(pageX, pageY);

    				if (dest === sourceZone) {
    					// same zone reorder
    					// style the dragging element
    					const enteredZone = dest !== drag.destZone;

    					// first render into this dropzone lets tidy up the last dropzone
    					if (enteredZone) {
    						if (drag.destZone !== undefined) {
    							drag.destZone.styleDestReset();
    						}
    					}

    					const hoverIndex = dest.pointIndex(pageX, pageY);

    					if (hoverIndex !== drag.hoverIndex || enteredZone) {
    						dest.styleSourceMove(hoverIndex, sourceIndex, drag.hoverIndex !== undefined);
    						active = { ...active, hoverIndex, destZone: dest };
    						set_store_value(dragging, $dragging = active, $dragging);
    					}

    					el.style.cssText = `position: fixed;
                            top: 0;
                            left: 0;
                            z-index:1000;
                            pointer-events:none;
                            cursor:grabbing;
                            height:${sourceZone.itemHeight()}px;
                            width:${sourceZone.itemWidth()}px; transition:height 0.2s cubic-bezier(0.2, 0, 0, 1), width 0.2s cubic-bezier(0.2, 0, 0, 1); position:fixed; transform:translate(${tx}px,${ty}px)`;
    				} else {
    					// new zone
    					const enteredZone = dest !== drag.destZone;

    					// first render into this dropzone (or out of if dest = undefined)
    					// lets tidy up the last dropzone
    					if (enteredZone) {
    						// source zone needs to render collapsing the missing item
    						if (drag.destZone === sourceZone) {
    							drag.destZone.styleSourceMissing(sourceIndex);
    						} else if (drag.destZone !== undefined) {
    							drag.destZone.styleDestReset(); // other zones can just render back to normal
    						}
    					}

    					if (dest !== undefined) {
    						// style the dragging element - it keeps its source dimensions as its not inside a drop zone
    						// lets increase this containers size on first render to hold the new
    						// item where hovering over it
    						if (enteredZone) {
    							// market this zone as needing style reseting a zone might be dragged
    							// over without, a drop, making it neither src or dest zone we still
    							// want to tidy up the styles we leave behind on dragend tho
    							drag.resetZones.add(dest);
    						}

    						// and adjust the styles of the items and update dragging
    						const hoverIndex = dest.pointIndex(pageX, pageY);

    						if (hoverIndex !== drag.hoverIndex || enteredZone) {
    							dest.styleDestMove(hoverIndex);
    							active = { ...active, hoverIndex, destZone: dest };
    							set_store_value(dragging, $dragging = active, $dragging);
    						}

    						el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; pointer-events: none; cursor:grabbing; position:fixed; height:${dest.itemHeight()}px; width:${dest.itemWidth()}px; transition: height 0.2s cubic-bezier(0.2, 0, 0, 1); transform:translate(${tx}px,${ty}px); transition:height 0.2s cubic-bezier(0.2, 0, 0, 1), width 0.2s cubic-bezier(0.2, 0, 0, 1);`;
    					} else {
    						// style the dragging element - it keeps its source dimensions as its not inside a drop zone
    						// first render out of a dropzone, update dragging
    						if (enteredZone) {
    							active = {
    								...active,
    								hoverIndex: -1,
    								destZone: undefined
    							};

    							set_store_value(dragging, $dragging = active, $dragging);
    						}

    						el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; pointer-events:none; cursor:grabbing; position:fixed; transform:translate(${tx}px,${ty}px); height:${drag.sourceZone.itemHeight()}px; width:${drag.sourceZone.itemWidth()}px;  transition:height 0.2s cubic-bezier(0.2, 0, 0, 1), width 0.2s cubic-bezier(0.2, 0, 0, 1);`;
    					}
    				}
    			});
    		}
    	}

    	function onMouseDragEnd(e) {
    		document.removeEventListener('mousemove', onMouseDrag);
    		document.removeEventListener('mouseup', onMouseDragEnd);

    		if (!active) {
    			return;
    		}

    		onDragEnd();
    	}

    	function onTouchDragEnd(e) {
    		document.removeEventListener('touchmove', onTouchDrag);
    		document.removeEventListener('touchend', onTouchDragEnd);

    		if (!active) {
    			return;
    		}

    		onDragEnd();
    	}

    	function onDragEnd() {
    		if (raf) {
    			cancelAnimationFrame(raf);
    		}

    		const { el, destZone, sourceZone, sourceIndex } = active;
    		const hoverIndex = active.hoverIndex ?? sourceIndex;
    		document.body.style.cursor = '';
    		el.addEventListener('transitionend', finalizeDrag);
    		let tx, ty, height, width, forceFinal = false;

    		if (destZone === sourceZone) {
    			let widthLastOffset = 0;
    			let heightLastOffset = 0;
    			const { count, direction } = sourceZone;

    			if (hoverIndex === count) {
    				if (direction === Direction$1.Vertical) {
    					heightLastOffset = -1;
    				} else if (direction === Direction$1.Horizontal) {
    					widthLastOffset = -1;
    				}
    			}

    			tx = sourceZone.dragXOffset(hoverIndex + widthLastOffset);
    			ty = sourceZone.dragYOffset(hoverIndex + heightLastOffset);
    			height = sourceZone.itemHeight();
    			width = sourceZone.itemWidth();

    			// detect when a transitionEnd event wont fire as the transition is already in the
    			// finishing position
    			forceFinal = el.style.transform === `translate(${tx}px, ${ty}px)` || el.style.transform === '';
    		} else if (destZone !== undefined) {
    			tx = destZone.dragXOffset(hoverIndex, destZone.count + 1);
    			ty = destZone.dragYOffset(hoverIndex, destZone.count + 1);
    			height = destZone.itemHeight();
    			width = destZone.itemWidth();
    		} else {
    			tx = sourceZone.dragXOffset(sourceIndex);
    			ty = sourceZone.dragYOffset(sourceIndex);
    			height = sourceZone.itemHeight();
    			width = sourceZone.itemWidth();
    			sourceZone.styleSourceMove(sourceIndex, sourceIndex, true);
    		}

    		el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; position:fixed; height:${height}px; width:${width}px; transform:translate(${tx}px,${ty}px); transition:transform 0.2s cubic-bezier(0.2,0,0,1), height 0.2s cubic-bezier(0.2, 0, 0, 1), width 0.2s cubic-bezier(0.2, 0, 0, 1);`;

    		// if a force was detected as needed, fire it off here
    		if (forceFinal) {
    			finalizeDrag();
    		}
    	}

    	function finalizeDrag(ev) {
    		const { el, destZone, sourceZone, sourceIndex, resetZones, placeholder } = active;
    		const hoverIndex = active.hoverIndex ?? sourceIndex; // if no drag action took place hover may be undef

    		if (ev && ev.target !== el) {
    			return;
    		}

    		if (raf) cancelAnimationFrame(raf);
    		raf = undefined;

    		const from = {
    			dropZoneID: sourceZone.id,
    			index: sourceIndex
    		};

    		const to = destZone
    		? destZone === sourceZone && hoverIndex === sourceIndex
    			? from
    			: {
    					dropZoneID: destZone.id,
    					index: hoverIndex
    				}
    		: undefined;

    		dispatch('drop', { from, to });

    		if (placeholder) {
    			sourceZone.el.removeChild(placeholder);
    		}

    		resetZones.forEach(zone => zone.styleRemove());
    		el.removeEventListener('transitionend', finalizeDrag);
    		active.onMoveResolve?.();
    		active = undefined;
    		set_store_value(dragging, $dragging = undefined, $dragging);
    	}

    	async function move(srcIndex, destIndex, destZone, transitionDur = 500) {
    		return new Promise((resolve, reject) => {
    				if (active !== undefined) {
    					resolve();
    					return;
    				}

    				const el = dropzone.items[srcIndex];

    				if (!el) {
    					resolve();
    					return;
    				}

    				// initial style for begining of element transition
    				{
    					const tx = dropzone.dragXOffset(srcIndex);
    					const ty = dropzone.dragYOffset(srcIndex);
    					const height = dropzone.itemHeight();
    					const width = dropzone.itemWidth();
    					el.style.cssText = `z-index:1000; height:${height}px; width:${width}px; position:fixed; transform:translate(${tx}px,${ty}px)`;
    				}

    				// style the containers
    				dropzone.styleSourceMove(srcIndex, srcIndex, false);

    				if (destZone !== dropzone) {
    					setTimeout(
    						() => {
    							active?.type === EventType$1.Programatic && dropzone.styleSourceMissing(srcIndex);
    						},
    						transitionDur * 0.4
    					);

    					destZone.styleDestMove(destIndex);
    				} else {
    					setTimeout(
    						() => {
    							active?.type === EventType$1.Programatic && dropzone.styleSourceMove(destIndex, srcIndex, true);
    						},
    						transitionDur * 0.25
    					);
    				}

    				active = {
    					type: EventType$1.Programatic,
    					el,
    					placeholder: undefined,
    					resetZones: new Set([dropzone, destZone]),
    					sourceIndex: srcIndex,
    					hoverIndex: destIndex,
    					sourceZone: dropzone,
    					destZone,
    					dragLeft: 0,
    					dragTop: 0,
    					onMoveResolve: resolve
    				};

    				set_store_value(dragging, $dragging = active, $dragging);

    				// style the moving element, to its final position/transition
    				{
    					const tx = destZone.dragXOffset(destIndex, destZone.count + 1);
    					const ty = destZone.dragYOffset(destIndex, destZone.count + 1);
    					const height = destZone.itemHeight();
    					const width = destZone.itemWidth();
    					el.addEventListener('transitionend', finalizeDrag);

    					el.style.cssText = `
                    z-index: 1000; 
                    position: fixed; 
                    top:0; left: 0;
                    height: ${height}px; 
                    width: ${width}px; 
                    transform: translate(${tx}px,${ty}px); 
                    transition:
                        transform ${transitionDur}ms cubic-bezier(0.2, 0, 0, 1), 
                        height ${transitionDur}ms cubic-bezier(0.2, 0, 0, 1), 
                        width ${transitionDur}ms cubic-bezier(0.2, 0, 0, 1);`;
    				}
    			});
    	}

    	const writable_props = [
    		'id',
    		'itemCount',
    		'itemSize',
    		'type',
    		'priority',
    		'itemClass',
    		'zoneClass',
    		'keyFn',
    		'useHandle',
    		'layerHeight',
    		'containerWidth'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ComponentList> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropzone.items[i] = $$value;
    			((($$invalidate(0, dropzone), $$invalidate(1, id)), $$invalidate(11, itemCount)), $$invalidate(12, itemSize));
    		});
    	}

    	const mousedown_handler = (i, e) => onMouseDown(e, i);
    	const touchstart_handler = (i, e) => onTouchDown(e, i);

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropzone.el = $$value;
    			((($$invalidate(0, dropzone), $$invalidate(1, id)), $$invalidate(11, itemCount)), $$invalidate(12, itemSize));
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('itemCount' in $$props) $$invalidate(11, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(12, itemSize = $$props.itemSize);
    		if ('type' in $$props) $$invalidate(13, type = $$props.type);
    		if ('priority' in $$props) $$invalidate(14, priority = $$props.priority);
    		if ('itemClass' in $$props) $$invalidate(2, itemClass = $$props.itemClass);
    		if ('zoneClass' in $$props) $$invalidate(3, zoneClass = $$props.zoneClass);
    		if ('keyFn' in $$props) $$invalidate(15, keyFn = $$props.keyFn);
    		if ('useHandle' in $$props) $$invalidate(16, useHandle = $$props.useHandle);
    		if ('layerHeight' in $$props) $$invalidate(4, layerHeight = $$props.layerHeight);
    		if ('containerWidth' in $$props) $$invalidate(5, containerWidth = $$props.containerWidth);
    	};

    	$$self.$capture_state = () => ({
    		ZONE_ATTR,
    		ZONE_SELECTOR,
    		HANDLE_SELECTOR,
    		DRAG_TOLERANCE,
    		dropzones,
    		click,
    		active,
    		raf,
    		dragging,
    		onMount,
    		createEventDispatcher,
    		Direction: Direction$1,
    		EventType: EventType$1,
    		writable,
    		Element,
    		Override,
    		collection,
    		HTMltagInfo,
    		id,
    		itemCount,
    		itemSize,
    		type,
    		priority,
    		itemClass,
    		zoneClass,
    		keyFn,
    		useHandle,
    		dropzone,
    		layerHeight,
    		containerWidth,
    		dispatch,
    		items,
    		findDropZone,
    		onMouseDown,
    		onTouchDown,
    		onDown,
    		onMouseDrag,
    		onTouchDrag,
    		onDrag,
    		onMouseDragEnd,
    		onTouchDragEnd,
    		onDragEnd,
    		finalizeDrag,
    		move,
    		itemStyle,
    		$dragging,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('itemCount' in $$props) $$invalidate(11, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(12, itemSize = $$props.itemSize);
    		if ('type' in $$props) $$invalidate(13, type = $$props.type);
    		if ('priority' in $$props) $$invalidate(14, priority = $$props.priority);
    		if ('itemClass' in $$props) $$invalidate(2, itemClass = $$props.itemClass);
    		if ('zoneClass' in $$props) $$invalidate(3, zoneClass = $$props.zoneClass);
    		if ('keyFn' in $$props) $$invalidate(15, keyFn = $$props.keyFn);
    		if ('useHandle' in $$props) $$invalidate(16, useHandle = $$props.useHandle);
    		if ('layerHeight' in $$props) $$invalidate(4, layerHeight = $$props.layerHeight);
    		if ('containerWidth' in $$props) $$invalidate(5, containerWidth = $$props.containerWidth);
    		if ('items' in $$props) items = $$props.items;
    		if ('itemStyle' in $$props) $$invalidate(6, itemStyle = $$props.itemStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*id*/ 2) {
    			$$invalidate(0, dropzone.id = id, dropzone);
    		}

    		if ($$self.$$.dirty[0] & /*itemCount, dropzone, itemSize*/ 6145) {
    			if (itemCount != dropzone.count || itemSize !== dropzone.itemSize) {
    				$$invalidate(0, dropzone.count = itemCount, dropzone);
    				$$invalidate(0, dropzone.itemSize = itemSize, dropzone);
    				items = new Array(itemCount);

    				if (dropzone.el) {
    					dropzone.styleContainerBaseStyle();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*dropzone, itemSize*/ 4097) {
    			$$invalidate(6, itemStyle = `${dropzone.direction === Direction$1.Vertical
			? 'height'
			: 'width'}: ${itemSize}px;`);
    		}
    	};

    	return [
    		dropzone,
    		id,
    		itemClass,
    		zoneClass,
    		layerHeight,
    		containerWidth,
    		itemStyle,
    		$dragging,
    		$collection,
    		onMouseDown,
    		onTouchDown,
    		itemCount,
    		itemSize,
    		type,
    		priority,
    		keyFn,
    		useHandle,
    		move,
    		div_binding,
    		mousedown_handler,
    		touchstart_handler,
    		div_binding_1
    	];
    }

    class ComponentList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$f,
    			create_fragment$f,
    			not_equal,
    			{
    				id: 1,
    				itemCount: 11,
    				itemSize: 12,
    				type: 13,
    				priority: 14,
    				itemClass: 2,
    				zoneClass: 3,
    				keyFn: 15,
    				useHandle: 16,
    				dropzone: 0,
    				layerHeight: 4,
    				containerWidth: 5,
    				move: 17
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ComponentList",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'id'");
    		}

    		if (/*itemCount*/ ctx[11] === undefined && !('itemCount' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'itemCount'");
    		}

    		if (/*itemSize*/ ctx[12] === undefined && !('itemSize' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'itemSize'");
    		}

    		if (/*type*/ ctx[13] === undefined && !('type' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'type'");
    		}
    	}

    	get id() {
    		return this.$$.ctx[1];
    	}

    	set id(id) {
    		this.$$set({ id });
    		flush();
    	}

    	get itemCount() {
    		return this.$$.ctx[11];
    	}

    	set itemCount(itemCount) {
    		this.$$set({ itemCount });
    		flush();
    	}

    	get itemSize() {
    		return this.$$.ctx[12];
    	}

    	set itemSize(itemSize) {
    		this.$$set({ itemSize });
    		flush();
    	}

    	get type() {
    		return this.$$.ctx[13];
    	}

    	set type(type) {
    		this.$$set({ type });
    		flush();
    	}

    	get priority() {
    		return this.$$.ctx[14];
    	}

    	set priority(priority) {
    		this.$$set({ priority });
    		flush();
    	}

    	get itemClass() {
    		return this.$$.ctx[2];
    	}

    	set itemClass(itemClass) {
    		this.$$set({ itemClass });
    		flush();
    	}

    	get zoneClass() {
    		return this.$$.ctx[3];
    	}

    	set zoneClass(zoneClass) {
    		this.$$set({ zoneClass });
    		flush();
    	}

    	get keyFn() {
    		return this.$$.ctx[15];
    	}

    	set keyFn(keyFn) {
    		this.$$set({ keyFn });
    		flush();
    	}

    	get useHandle() {
    		return this.$$.ctx[16];
    	}

    	set useHandle(useHandle) {
    		this.$$set({ useHandle });
    		flush();
    	}

    	get dropzone() {
    		return this.$$.ctx[0];
    	}

    	set dropzone(value) {
    		throw new Error("<ComponentList>: Cannot set read-only property 'dropzone'");
    	}

    	get layerHeight() {
    		return this.$$.ctx[4];
    	}

    	set layerHeight(layerHeight) {
    		this.$$set({ layerHeight });
    		flush();
    	}

    	get containerWidth() {
    		return this.$$.ctx[5];
    	}

    	set containerWidth(containerWidth) {
    		this.$$set({ containerWidth });
    		flush();
    	}

    	get move() {
    		return this.$$.ctx[17];
    	}

    	set move(value) {
    		throw new Error("<ComponentList>: Cannot set read-only property 'move'");
    	}
    }

    var Direction;
    (function (Direction) {
        Direction[Direction["Vertical"] = 0] = "Vertical";
        Direction[Direction["Horizontal"] = 1] = "Horizontal";
    })(Direction || (Direction = {}));
    var EventType;
    (function (EventType) {
        EventType[EventType["Programatic"] = 0] = "Programatic";
        EventType[EventType["User"] = 1] = "User";
    })(EventType || (EventType = {}));

    class VerticalDropZone {
        direction = Direction.Vertical;
        id;
        priority;
        itemSize;
        count;
        el;
        items;
        containerClass;
        constructor(id, count, priority, itemSize) {
            this.id = id;
            this.priority = priority;
            this.count = count;
            this.itemSize = itemSize;
            this.items = new Array(count);
            this.el = undefined;
            this.containerClass = 'vertical';
        }
        pointIndex(x, y) {
            const { el, itemSize, count } = this;
            const b = el.getBoundingClientRect();
            const top = b.top - el.scrollTop + window.scrollY;
            const rawOver = Math.floor((y - top) / itemSize);
            return Math.min(Math.max(rawOver, 0), count);
        }
        placeholderStyleStr() {
            return `height: ${500}px; width: 100%;`;
        }
        dragXOffset(index) {
            const b = this.el.getBoundingClientRect();
            return b.left;
        }
        dragYOffset(index) {
            const { items } = this;
            const b = this.el.getBoundingClientRect();
            // calculate height for all elements above it
            let sumHeight = 0;
            for(let i = 0; i < index; i++){
                sumHeight += items[i].getBoundingClientRect().height;
            }
            return sumHeight + b.top;
        }
        itemHeight() {
            return this.itemSize;
        }
        itemWidth() {
            return this.el.clientWidth;
        }
        styleSourceMove(hover, source, transition) {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                // move element to base
                const base = (hover > source && (i < source || (i > source && i <= hover))) ||
                    (hover < source && i < hover) ||
                    (hover == source && i < source);
                // move element down
                const raise = (hover > source && i > hover) ||
                    (hover < source && ((i >= hover && i < source) || i > source)) ||
                    (hover == source && i > source);
                const item = items[i];
                if (base) {
                    item &&
                        // (item.style.cssText = `transform: translateY(0px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${itemSize}px;`); SIG CHANGE
                        (item.style.cssText = `transform: translateY(0px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
                else if (raise) {
                    if (transition) {
                        item &&
                            // (item.style.cssText = `transform: translateY(${itemSize}px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${itemSize}px;`);
                            (item.style.cssText = `transform: translateY(${item.getBoundingClientRect().height}px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                    }
                    else {
                        // prevent the transition jump on first render
                        item &&
                            // (item.style.cssText = `transform: translateY(${itemSize}px); height: ${itemSize}px;`);
                            (item.style.cssText = `transform: translateY(${item.getBoundingClientRect().height}px); height: ${item.getBoundingClientRect().height}px;`);
                    }
                }
            }
        }
        styleSourceMissing(index) {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                item &&
                    i !== index &&
                    (items[i].style.cssText = `transform: translateY(0px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${items[i].getBoundingClientRect().height}px;`);
            }
        }
        styleDestMove(index) {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                if (i < index) {
                    item &&
                        (item.style.cssText = `transform: translateY(0px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
                else {
                    item &&
                        (item.style.cssText = `transform: translateY(${item.getBoundingClientRect().height}px); transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
            }
        }
        styleDestReset() {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                item &&
                    (items[i].style.cssText = `transform:translateY(0px); transition:transform 0.2s cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
            }
        }
        styleRemove() {
            this.styleContainerBaseStyle();
        }
        styleContainerBaseStyle() {
            const { items, itemSize } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                // item && (item.style.cssText = `height: ${itemSize}px;`); SIG CHANGE
                item && (item.style.cssText = "");
            }
        }
    }

    /* node_modules/svelte-dnd-list/DragDropList.svelte generated by Svelte v3.48.0 */
    new Array();

    function reorder(list, startIndex, endIndex) {
        const result = list.slice();
        const [removed] = result.splice(startIndex, 1);
        if (endIndex > result.length) {
            result.push(removed);
        }
        else {
            result.splice(endIndex, 0, removed);
        }
        return result;
    }

    /* src/comp/ctrlMenuItems/CollectionViewer.svelte generated by Svelte v3.48.0 */
    const file$e = "src/comp/ctrlMenuItems/CollectionViewer.svelte";

    function create_fragment$e(ctx) {
    	let main;
    	let componentlist;
    	let current;

    	componentlist = new ComponentList({
    			props: {
    				id: "componentList",
    				type: VerticalDropZone,
    				itemSize: 45,
    				itemCount: /*$collection*/ ctx[1].length,
    				layerHeight,
    				containerWidth: /*containerWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	componentlist.$on("drop", /*onDrop*/ ctx[2]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(componentlist.$$.fragment);
    			attr_dev(main, "class", "svelte-ma6ln2");
    			add_location(main, file$e, 15, 0, 516);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(componentlist, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const componentlist_changes = {};
    			if (dirty & /*$collection*/ 2) componentlist_changes.itemCount = /*$collection*/ ctx[1].length;
    			if (dirty & /*containerWidth*/ 1) componentlist_changes.containerWidth = /*containerWidth*/ ctx[0];
    			componentlist.$set(componentlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(componentlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(componentlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(componentlist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const layerHeight = 35; // px

    function instance$e($$self, $$props, $$invalidate) {
    	let $collection;
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(1, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CollectionViewer', slots, []);
    	let { containerWidth } = $$props;

    	function onDrop({ detail: { from, to } }) {
    		if (!to || from === to) {
    			return;
    		}

    		set_store_value(collection, $collection = reorder($collection, from.index, to.index), $collection);
    	}

    	const writable_props = ['containerWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CollectionViewer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		ComponentList,
    		VerticalDropZone,
    		reorder,
    		containerWidth,
    		onDrop,
    		layerHeight,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [containerWidth, $collection, onDrop];
    }

    class CollectionViewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { containerWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CollectionViewer",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*containerWidth*/ ctx[0] === undefined && !('containerWidth' in props)) {
    			console.warn("<CollectionViewer> was created without expected prop 'containerWidth'");
    		}
    	}

    	get containerWidth() {
    		throw new Error("<CollectionViewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<CollectionViewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let currentView = writable("edit");

    /* src/comp/controls/MultiToggle.svelte generated by Svelte v3.48.0 */
    const file$d = "src/comp/controls/MultiToggle.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (31:4) {#each elements as ele}
    function create_each_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_class_value;
    	let t;
    	let div_id_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*ele*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*ele*/ ctx[12].iconDir)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*ele*/ ctx[12].alt);

    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*selectedElementID*/ ctx[4] === /*ele*/ ctx[12].elementID
    			? "selected"
    			: "") + " svelte-aafjdz"));

    			add_location(img, file$d, 33, 12, 1280);
    			attr_dev(div, "class", "toggle-element svelte-aafjdz");
    			attr_dev(div, "id", div_id_value = /*ele*/ ctx[12].elementID);
    			set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			add_location(div, file$d, 32, 8, 1112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*elements*/ 1 && !src_url_equal(img.src, img_src_value = /*ele*/ ctx[12].iconDir)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*elements*/ 1 && img_alt_value !== (img_alt_value = /*ele*/ ctx[12].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*selectedElementID, elements*/ 17 && img_class_value !== (img_class_value = "" + (null_to_empty(/*selectedElementID*/ ctx[4] === /*ele*/ ctx[12].elementID
    			? "selected"
    			: "") + " svelte-aafjdz"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*elements*/ 1 && div_id_value !== (div_id_value = /*ele*/ ctx[12].elementID)) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (dirty & /*containerWidth, elements*/ 3) {
    				set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(31:4) {#each elements as ele}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let t;
    	let div;
    	let each_value = /*elements*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "selector svelte-aafjdz");
    			set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			add_location(div, file$d, 38, 4, 1438);
    			set_style(main, "width", /*containerWidth*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-aafjdz");
    			add_location(main, file$d, 29, 0, 942);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t);
    			append_dev(main, div);
    			/*div_binding*/ ctx[9](div);
    			/*main_binding*/ ctx[10](main);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*elements, containerWidth, updateView, selectedElementID*/ 83) {
    				each_value = /*elements*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*containerWidth, elements*/ 3) {
    				set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			}

    			if (dirty & /*containerWidth*/ 2) {
    				set_style(main, "width", /*containerWidth*/ ctx[1] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[9](null);
    			/*main_binding*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(11, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MultiToggle', slots, []);
    	let { elements } = $$props;
    	let { containerWidth } = $$props;
    	let { store } = $$props;
    	validate_store(store, 'store');
    	$$subscribe_store();
    	let { defaultSelection } = $$props;
    	let containerElement;
    	let selectedElementID;
    	let selector;

    	const updateView = (storeVal, elementID) => {
    		set_store_value(store, $store = storeVal, $store);
    		$$invalidate(4, selectedElementID = elementID);
    	};

    	// when initialized, set selectedElementID to the index speciied by defaultSelection
    	onMount(() => {
    		set_store_value(store, $store = elements[defaultSelection].storeVal, $store);
    		$$invalidate(4, selectedElementID = elements[defaultSelection].elementID);
    	});

    	const writable_props = ['elements', 'containerWidth', 'store', 'defaultSelection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MultiToggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ele => updateView(ele.storeVal, ele.elementID);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selector = $$value;
    			(($$invalidate(5, selector), $$invalidate(4, selectedElementID)), $$invalidate(3, containerElement));
    		});
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			containerElement = $$value;
    			$$invalidate(3, containerElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('elements' in $$props) $$invalidate(0, elements = $$props.elements);
    		if ('containerWidth' in $$props) $$invalidate(1, containerWidth = $$props.containerWidth);
    		if ('store' in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    		if ('defaultSelection' in $$props) $$invalidate(7, defaultSelection = $$props.defaultSelection);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		elements,
    		containerWidth,
    		store,
    		defaultSelection,
    		containerElement,
    		selectedElementID,
    		selector,
    		updateView,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ('elements' in $$props) $$invalidate(0, elements = $$props.elements);
    		if ('containerWidth' in $$props) $$invalidate(1, containerWidth = $$props.containerWidth);
    		if ('store' in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    		if ('defaultSelection' in $$props) $$invalidate(7, defaultSelection = $$props.defaultSelection);
    		if ('containerElement' in $$props) $$invalidate(3, containerElement = $$props.containerElement);
    		if ('selectedElementID' in $$props) $$invalidate(4, selectedElementID = $$props.selectedElementID);
    		if ('selector' in $$props) $$invalidate(5, selector = $$props.selector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedElementID, containerElement*/ 24) {
    			if (!!selectedElementID) {
    				// calculate the positional difference, and set translate3d for the selector (the purple highlight)
    				const posDiff = document.getElementById(selectedElementID).getBoundingClientRect().x - containerElement.getBoundingClientRect().x;

    				$$invalidate(5, selector.style.transform = `translate3d(${posDiff}px, 0, 0)`, selector);
    			}
    		}
    	};

    	return [
    		elements,
    		containerWidth,
    		store,
    		containerElement,
    		selectedElementID,
    		selector,
    		updateView,
    		defaultSelection,
    		click_handler,
    		div_binding,
    		main_binding
    	];
    }

    class MultiToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			elements: 0,
    			containerWidth: 1,
    			store: 2,
    			defaultSelection: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiToggle",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*elements*/ ctx[0] === undefined && !('elements' in props)) {
    			console.warn("<MultiToggle> was created without expected prop 'elements'");
    		}

    		if (/*containerWidth*/ ctx[1] === undefined && !('containerWidth' in props)) {
    			console.warn("<MultiToggle> was created without expected prop 'containerWidth'");
    		}

    		if (/*store*/ ctx[2] === undefined && !('store' in props)) {
    			console.warn("<MultiToggle> was created without expected prop 'store'");
    		}

    		if (/*defaultSelection*/ ctx[7] === undefined && !('defaultSelection' in props)) {
    			console.warn("<MultiToggle> was created without expected prop 'defaultSelection'");
    		}
    	}

    	get elements() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elements(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerWidth() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get store() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultSelection() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultSelection(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenuItems/ViewSwitcher.svelte generated by Svelte v3.48.0 */
    const file$c = "src/comp/ctrlMenuItems/ViewSwitcher.svelte";

    function create_fragment$c(ctx) {
    	let main;
    	let a;
    	let img;
    	let img_src_value;
    	let t;
    	let multitoggle;
    	let current;

    	multitoggle = new MultiToggle({
    			props: {
    				elements: /*viewToggleElements*/ ctx[0],
    				containerWidth: 104,
    				store: currentView,
    				defaultSelection: 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			a = element("a");
    			img = element("img");
    			t = space();
    			create_component(multitoggle.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "./assets/svgs/emblem_flat.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1nsh9u8");
    			add_location(img, file$c, 20, 33, 564);
    			attr_dev(a, "href", "https://google.com");
    			attr_dev(a, "class", "svelte-1nsh9u8");
    			add_location(a, file$c, 20, 4, 535);
    			attr_dev(main, "class", "svelte-1nsh9u8");
    			add_location(main, file$c, 19, 0, 524);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, a);
    			append_dev(a, img);
    			append_dev(main, t);
    			mount_component(multitoggle, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multitoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multitoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(multitoggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ViewSwitcher', slots, []);
    	const componentUUID = crypto.randomUUID();

    	const viewToggleElements = [
    		{
    			iconDir: "./assets/icons/cube.svg",
    			storeVal: "edit",
    			elementID: `${componentUUID}-1`,
    			alt: "edit"
    		},
    		{
    			iconDir: "./assets/icons/pantone.svg",
    			storeVal: "palette",
    			elementID: `${componentUUID}-2`,
    			alt: "palette"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ViewSwitcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		currentView,
    		MultiToggle,
    		componentUUID,
    		viewToggleElements
    	});

    	return [viewToggleElements];
    }

    class ViewSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewSwitcher",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/comp/ctrlMenus/LeftMenu.svelte generated by Svelte v3.48.0 */
    const file$b = "src/comp/ctrlMenus/LeftMenu.svelte";

    function create_fragment$b(ctx) {
    	let main;
    	let viewswitcher;
    	let t0;
    	let collectionviewer;
    	let t1;
    	let div;
    	let current;
    	viewswitcher = new ViewSwitcher({ $$inline: true });

    	collectionviewer = new CollectionViewer({
    			props: { containerWidth: /*currentWidth*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(viewswitcher.$$.fragment);
    			t0 = space();
    			create_component(collectionviewer.$$.fragment);
    			t1 = space();
    			div = element("div");
    			attr_dev(div, "id", "drag-space");
    			attr_dev(div, "class", "svelte-1krrreq");
    			add_location(div, file$b, 34, 4, 1156);
    			set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-1krrreq");
    			add_location(main, file$b, 27, 0, 969);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(viewswitcher, main, null);
    			append_dev(main, t0);
    			mount_component(collectionviewer, main, null);
    			append_dev(main, t1);
    			append_dev(main, div);
    			/*div_binding*/ ctx[2](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const collectionviewer_changes = {};
    			if (dirty & /*currentWidth*/ 2) collectionviewer_changes.containerWidth = /*currentWidth*/ ctx[1];
    			collectionviewer.$set(collectionviewer_changes);

    			if (!current || dirty & /*currentWidth*/ 2) {
    				set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(viewswitcher.$$.fragment, local);
    			transition_in(collectionviewer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(viewswitcher.$$.fragment, local);
    			transition_out(collectionviewer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(viewswitcher);
    			destroy_component(collectionviewer);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LeftMenu', slots, []);
    	const disp = createEventDispatcher();
    	let dragSpace;
    	let currentWidth = 260;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LeftMenu> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dragSpace = $$value;
    			($$invalidate(0, dragSpace), $$invalidate(1, currentWidth));
    		});
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		CollectionViewer,
    		ViewSwitcher,
    		disp,
    		dragSpace,
    		currentWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('dragSpace' in $$props) $$invalidate(0, dragSpace = $$props.dragSpace);
    		if ('currentWidth' in $$props) $$invalidate(1, currentWidth = $$props.currentWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dragSpace, currentWidth*/ 3) {
    			if (!!dragSpace) {
    				// as soon as dragSpace is initialized, add the drag event listener for resize
    				$$invalidate(
    					0,
    					dragSpace.onmousedown = () => {
    						document.onmousemove = e => {
    							e.preventDefault();
    							document.body.style.cursor = "col-resize"; // set consistent cursor

    							if (e.clientX < 350 && e.clientX > 200) {
    								$$invalidate(1, currentWidth = e.clientX);
    								disp("widthChange", { width: currentWidth });
    							}
    						};
    					},
    					dragSpace
    				);

    				document.onmouseup = () => {
    					document.body.style.cursor = "default"; // reset cursor
    					document.onmousemove = undefined;
    				};
    			}
    		}
    	};

    	return [dragSpace, currentWidth, div_binding];
    }

    class LeftMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeftMenu",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/comp/ctrlMenus/RightMenu.svelte generated by Svelte v3.48.0 */
    const file$a = "src/comp/ctrlMenus/RightMenu.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			attr_dev(div, "id", "drag-space");
    			attr_dev(div, "class", "svelte-1uz0d8o");
    			add_location(div, file$a, 27, 4, 962);
    			set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-1uz0d8o");
    			add_location(main, file$a, 25, 0, 891);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentWidth*/ 2) {
    				set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RightMenu', slots, []);
    	const disp = createEventDispatcher();
    	let dragSpace;
    	let currentWidth = 360;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RightMenu> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dragSpace = $$value;
    			($$invalidate(0, dragSpace), $$invalidate(1, currentWidth));
    		});
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		disp,
    		dragSpace,
    		currentWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('dragSpace' in $$props) $$invalidate(0, dragSpace = $$props.dragSpace);
    		if ('currentWidth' in $$props) $$invalidate(1, currentWidth = $$props.currentWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dragSpace, currentWidth*/ 3) {
    			if (!!dragSpace) {
    				// as soon as dragSpace is initialized, add the drag event listener for resize
    				$$invalidate(
    					0,
    					dragSpace.onmousedown = () => {
    						document.onmousemove = e => {
    							e.preventDefault();
    							document.body.style.cursor = "col-resize"; // set consistent cursor

    							if (window.innerWidth - e.clientX < 500 && window.innerWidth - e.clientX > 300) {
    								$$invalidate(1, currentWidth = window.innerWidth - e.clientX);
    								disp("widthChange", { width: currentWidth });
    							}
    						};
    					},
    					dragSpace
    				);

    				document.onmouseup = () => {
    					document.body.style.cursor = "default"; // reset cursor
    					document.onmousemove = undefined;
    				};
    			}
    		}
    	};

    	return [dragSpace, currentWidth, div_binding];
    }

    class RightMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RightMenu",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    let fileStat = writable({
        name: "Untitled",
        saved: false,
        autoSavetoCloud: false,
        alwaysShowSaveStatus: false
    });

    /* src/comp/ctrlMenuItems/FileNameEditor.svelte generated by Svelte v3.48.0 */
    const file$9 = "src/comp/ctrlMenuItems/FileNameEditor.svelte";

    // (34:8) {#if !$fileStat.saved}
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Saving to the cloud...";
    			attr_dev(p, "class", "svelte-1iakpd8");
    			add_location(p, file$9, 34, 12, 1043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:8) {#if !$fileStat.saved}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if $fileStat.alwaysShowSaveStatus}
    function create_if_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*$fileStat*/ ctx[3].saved) return create_if_block_1$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(27:4) {#if $fileStat.alwaysShowSaveStatus}",
    		ctx
    	});

    	return block;
    }

    // (30:8) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Saved";
    			attr_dev(p, "class", "svelte-1iakpd8");
    			add_location(p, file$9, 30, 12, 961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(30:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#if !$fileStat.saved}
    function create_if_block_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Saving to the cloud...";
    			attr_dev(p, "class", "svelte-1iakpd8");
    			add_location(p, file$9, 28, 12, 903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(28:8) {#if !$fileStat.saved}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let span;
    	let t0_value = /*$fileStat*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$fileStat*/ ctx[3].alwaysShowSaveStatus) return create_if_block$2;
    		if (!/*$fileStat*/ ctx[3].saved) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "type", "text");
    			attr_dev(span, "contenteditable", "true");
    			attr_dev(span, "placeholder", "Untitled");
    			set_style(span, "max-width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px - " + /*controlSectionWidth*/ ctx[1] + "px)");
    			attr_dev(span, "class", "svelte-1iakpd8");
    			add_location(span, file$9, 24, 4, 564);
    			attr_dev(main, "class", "svelte-1iakpd8");
    			add_location(main, file$9, 23, 0, 553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, span);
    			append_dev(span, t0);
    			/*span_binding*/ ctx[5](span);
    			append_dev(main, t1);
    			if (if_block) if_block.m(main, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "keypress", /*preventNewline*/ ctx[4], false, false, false),
    					listen_dev(span, "paste", paste_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$fileStat*/ 8 && t0_value !== (t0_value = /*$fileStat*/ ctx[3].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*leftMenuWidth, controlSectionWidth*/ 3) {
    				set_style(span, "max-width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px - " + /*controlSectionWidth*/ ctx[1] + "px)");
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*span_binding*/ ctx[5](null);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const paste_handler = e => e.preventDefault();

    function instance$9($$self, $$props, $$invalidate) {
    	let $fileStat;
    	validate_store(fileStat, 'fileStat');
    	component_subscribe($$self, fileStat, $$value => $$invalidate(3, $fileStat = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileNameEditor', slots, []);
    	let { leftMenuWidth = 260 } = $$props;
    	let { controlSectionWidth = 500 } = $$props;
    	let fileNameField;

    	const preventNewline = e => {
    		if (e.key === "Enter") {
    			e.preventDefault();
    			fileNameField.blur();
    			return;
    		}

    		if (fileNameField.innerHTML.length > 50) {
    			e.preventDefault();
    			return;
    		}
    	};

    	const writable_props = ['leftMenuWidth', 'controlSectionWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileNameEditor> was created with unknown prop '${key}'`);
    	});

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileNameField = $$value;
    			$$invalidate(2, fileNameField);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('controlSectionWidth' in $$props) $$invalidate(1, controlSectionWidth = $$props.controlSectionWidth);
    	};

    	$$self.$capture_state = () => ({
    		fileStat,
    		leftMenuWidth,
    		controlSectionWidth,
    		fileNameField,
    		preventNewline,
    		$fileStat
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('controlSectionWidth' in $$props) $$invalidate(1, controlSectionWidth = $$props.controlSectionWidth);
    		if ('fileNameField' in $$props) $$invalidate(2, fileNameField = $$props.fileNameField);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*fileNameField*/ 4) {
    			if (!!fileNameField) {
    				// once initialized
    				$$invalidate(
    					2,
    					fileNameField.onblur = () => {
    						$$invalidate(2, fileNameField.scrollLeft = 0, fileNameField);
    					},
    					fileNameField
    				);
    			}
    		}
    	};

    	return [
    		leftMenuWidth,
    		controlSectionWidth,
    		fileNameField,
    		$fileStat,
    		preventNewline,
    		span_binding
    	];
    }

    class FileNameEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { leftMenuWidth: 0, controlSectionWidth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileNameEditor",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get leftMenuWidth() {
    		throw new Error("<FileNameEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftMenuWidth(value) {
    		throw new Error("<FileNameEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get controlSectionWidth() {
    		throw new Error("<FileNameEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set controlSectionWidth(value) {
    		throw new Error("<FileNameEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenuItems/GeneralAppControl/RegularControl.svelte generated by Svelte v3.48.0 */

    const file$8 = "src/comp/ctrlMenuItems/GeneralAppControl/RegularControl.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*imageURI*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			attr_dev(img, "class", "svelte-1pahiv5");
    			add_location(img, file$8, 6, 4, 132);
    			attr_dev(main, "title", /*alt*/ ctx[1]);
    			attr_dev(main, "class", "svelte-1pahiv5");
    			add_location(main, file$8, 5, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);

    			if (!mounted) {
    				dispose = listen_dev(
    					main,
    					"click",
    					function () {
    						if (is_function(/*cta*/ ctx[2])) /*cta*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*imageURI*/ 1 && !src_url_equal(img.src, img_src_value = /*imageURI*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(main, "title", /*alt*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RegularControl', slots, []);
    	let { imageURI } = $$props;
    	let { alt } = $$props;

    	let { cta = () => {
    		
    	} } = $$props;

    	const writable_props = ['imageURI', 'alt', 'cta'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RegularControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('cta' in $$props) $$invalidate(2, cta = $$props.cta);
    	};

    	$$self.$capture_state = () => ({ imageURI, alt, cta });

    	$$self.$inject_state = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('cta' in $$props) $$invalidate(2, cta = $$props.cta);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageURI, alt, cta];
    }

    class RegularControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { imageURI: 0, alt: 1, cta: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegularControl",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imageURI*/ ctx[0] === undefined && !('imageURI' in props)) {
    			console.warn("<RegularControl> was created without expected prop 'imageURI'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !('alt' in props)) {
    			console.warn("<RegularControl> was created without expected prop 'alt'");
    		}
    	}

    	get imageURI() {
    		throw new Error("<RegularControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageURI(value) {
    		throw new Error("<RegularControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<RegularControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<RegularControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cta() {
    		throw new Error("<RegularControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cta(value) {
    		throw new Error("<RegularControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let canvasStatus = writable({
        x: 0,
        y: 0,
        zoom: 1,
        darkMode: false
    });

    /* src/comp/ctrlMenuItems/GeneralAppControl/ZoomControl.svelte generated by Svelte v3.48.0 */
    const file$7 = "src/comp/ctrlMenuItems/GeneralAppControl/ZoomControl.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let p;
    	let t0_value = Math.round(/*$canvasStatus*/ ctx[0].zoom * 100) + "";
    	let t0;
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text("%");
    			t2 = space();
    			img = element("img");
    			attr_dev(p, "class", "svelte-1rjcoq4");
    			add_location(p, file$7, 4, 4, 121);
    			attr_dev(img, "class", "more-options svelte-1rjcoq4");
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/chevron-down.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 8, 4, 191);
    			attr_dev(main, "title", "Canvas zoom");
    			attr_dev(main, "class", "svelte-1rjcoq4");
    			add_location(main, file$7, 3, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(main, t2);
    			append_dev(main, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$canvasStatus*/ 1 && t0_value !== (t0_value = Math.round(/*$canvasStatus*/ ctx[0].zoom * 100) + "")) set_data_dev(t0, t0_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $canvasStatus;
    	validate_store(canvasStatus, 'canvasStatus');
    	component_subscribe($$self, canvasStatus, $$value => $$invalidate(0, $canvasStatus = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ZoomControl', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ZoomControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ canvasStatus, $canvasStatus });
    	return [$canvasStatus];
    }

    class ZoomControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZoomControl",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/comp/ctrlMenuItems/GeneralAppControl.svelte generated by Svelte v3.48.0 */
    const file$6 = "src/comp/ctrlMenuItems/GeneralAppControl.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let t0;
    	let regularcontrol0;
    	let t1;
    	let regularcontrol1;
    	let t2;
    	let regularcontrol2;
    	let t3;
    	let div;
    	let t4;
    	let zoomcontrol;
    	let current;

    	regularcontrol0 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/share.svg",
    				alt: "Export"
    			},
    			$$inline: true
    		});

    	regularcontrol1 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/expand.svg",
    				alt: "Checklist"
    			},
    			$$inline: true
    		});

    	regularcontrol2 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/sun.svg",
    				alt: "Toggle dark mode"
    			},
    			$$inline: true
    		});

    	zoomcontrol = new ZoomControl({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			t0 = space();
    			create_component(regularcontrol0.$$.fragment);
    			t1 = space();
    			create_component(regularcontrol1.$$.fragment);
    			t2 = space();
    			create_component(regularcontrol2.$$.fragment);
    			t3 = space();
    			div = element("div");
    			t4 = space();
    			create_component(zoomcontrol.$$.fragment);
    			attr_dev(img, "id", "pfp");
    			if (!src_url_equal(img.src, img_src_value = "./assets/pngs/testpfp.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1x7csmn");
    			add_location(img, file$6, 25, 4, 713);
    			set_style(div, "width", "10px");
    			add_location(div, file$6, 37, 4, 1105);
    			attr_dev(main, "class", "svelte-1x7csmn");
    			add_location(main, file$6, 23, 0, 625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t0);
    			mount_component(regularcontrol0, main, null);
    			append_dev(main, t1);
    			mount_component(regularcontrol1, main, null);
    			append_dev(main, t2);
    			mount_component(regularcontrol2, main, null);
    			append_dev(main, t3);
    			append_dev(main, div);
    			append_dev(main, t4);
    			mount_component(zoomcontrol, main, null);
    			/*main_binding*/ ctx[2](main);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(regularcontrol0.$$.fragment, local);
    			transition_in(regularcontrol1.$$.fragment, local);
    			transition_in(regularcontrol2.$$.fragment, local);
    			transition_in(zoomcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(regularcontrol0.$$.fragment, local);
    			transition_out(regularcontrol1.$$.fragment, local);
    			transition_out(regularcontrol2.$$.fragment, local);
    			transition_out(zoomcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(regularcontrol0);
    			destroy_component(regularcontrol1);
    			destroy_component(regularcontrol2);
    			destroy_component(zoomcontrol);
    			/*main_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GeneralAppControl', slots, []);
    	const disp = createEventDispatcher();
    	let { dropdownStatus = { currentID: "", active: false } } = $$props;
    	let mainContainer;

    	const toggleDropdown = () => {
    		disp("toggleDropdown");
    	};

    	const updateCurrentID = evt => {
    		disp("updateCurrentID", evt.detail);
    	};

    	const writable_props = ['dropdownStatus'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GeneralAppControl> was created with unknown prop '${key}'`);
    	});

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainContainer = $$value;
    			$$invalidate(0, mainContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('dropdownStatus' in $$props) $$invalidate(1, dropdownStatus = $$props.dropdownStatus);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		RegularControl,
    		ZoomControl,
    		disp,
    		dropdownStatus,
    		mainContainer,
    		toggleDropdown,
    		updateCurrentID
    	});

    	$$self.$inject_state = $$props => {
    		if ('dropdownStatus' in $$props) $$invalidate(1, dropdownStatus = $$props.dropdownStatus);
    		if ('mainContainer' in $$props) $$invalidate(0, mainContainer = $$props.mainContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mainContainer*/ 1) {
    			if (!!mainContainer) {
    				disp("widthChange", {
    					width: mainContainer.getBoundingClientRect().width + 100
    				});
    			}
    		}
    	};

    	return [mainContainer, dropdownStatus, main_binding];
    }

    class GeneralAppControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { dropdownStatus: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeneralAppControl",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get dropdownStatus() {
    		throw new Error("<GeneralAppControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownStatus(value) {
    		throw new Error("<GeneralAppControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenuItems/DropdownOptions/RegularOption.svelte generated by Svelte v3.48.0 */

    const file$5 = "src/comp/ctrlMenuItems/DropdownOptions/RegularOption.svelte";

    // (7:8) {#if !!options.iconSrc}
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*options*/ ctx[0].iconSrc)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "15px");
    			attr_dev(img, "height", "15px");
    			attr_dev(img, "class", "svelte-19b3kdw");
    			add_location(img, file$5, 7, 12, 184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 1 && !src_url_equal(img.src, img_src_value = /*options*/ ctx[0].iconSrc)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(7:8) {#if !!options.iconSrc}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if !!options.desc}
    function create_if_block$1(ctx) {
    	let p;
    	let t_value = /*options*/ ctx[0].desc + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "id", "desc");
    			attr_dev(p, "class", "svelte-19b3kdw");
    			add_location(p, file$5, 16, 8, 390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 1 && t_value !== (t_value = /*options*/ ctx[0].desc + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(16:4) {#if !!options.desc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let section;
    	let t0;
    	let p;
    	let t1_value = /*options*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let main_title_value;
    	let mounted;
    	let dispose;
    	let if_block0 = !!/*options*/ ctx[0].iconSrc && create_if_block_1$1(ctx);
    	let if_block1 = !!/*options*/ ctx[0].desc && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(p, "id", "title");
    			attr_dev(p, "class", "svelte-19b3kdw");
    			add_location(p, file$5, 10, 8, 281);
    			attr_dev(section, "class", "svelte-19b3kdw");
    			add_location(section, file$5, 4, 4, 107);
    			attr_dev(main, "title", main_title_value = /*options*/ ctx[0].title);
    			attr_dev(main, "class", "svelte-19b3kdw");
    			add_location(main, file$5, 3, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			append_dev(section, p);
    			append_dev(p, t1);
    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);

    			if (!mounted) {
    				dispose = listen_dev(
    					main,
    					"mouseup",
    					function () {
    						if (is_function(/*options*/ ctx[0].cta)) /*options*/ ctx[0].cta.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!!/*options*/ ctx[0].iconSrc) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*options*/ 1 && t1_value !== (t1_value = /*options*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (!!/*options*/ ctx[0].desc) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*options*/ 1 && main_title_value !== (main_title_value = /*options*/ ctx[0].title)) {
    				attr_dev(main, "title", main_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RegularOption', slots, []);
    	let { options } = $$props;
    	const writable_props = ['options'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RegularOption> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(0, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({ options });

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(0, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [options];
    }

    class RegularOption extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { options: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegularOption",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[0] === undefined && !('options' in props)) {
    			console.warn("<RegularOption> was created without expected prop 'options'");
    		}
    	}

    	get options() {
    		throw new Error("<RegularOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<RegularOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenuItems/DropdownOptions/Separator.svelte generated by Svelte v3.48.0 */

    const file$4 = "src/comp/ctrlMenuItems/DropdownOptions/Separator.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			attr_dev(div, "class", "svelte-9id6tf");
    			add_location(div, file$4, 3, 4, 40);
    			attr_dev(main, "class", "svelte-9id6tf");
    			add_location(main, file$4, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Separator', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Separator> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Separator",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/comp/ctrlMenuItems/GeneralAppControl/DropdownControl.svelte generated by Svelte v3.48.0 */
    const file$3 = "src/comp/ctrlMenuItems/GeneralAppControl/DropdownControl.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (34:42) 
    function create_if_block_1(ctx) {
    	let separator;
    	let current;
    	separator = new Separator({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(separator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(separator, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(separator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(separator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(34:42) ",
    		ctx
    	});

    	return block;
    }

    // (32:12) {#if item.type === "reg"}
    function create_if_block(ctx) {
    	let regularoption;
    	let current;

    	regularoption = new RegularOption({
    			props: { options: /*item*/ ctx[10] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(regularoption.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(regularoption, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const regularoption_changes = {};
    			if (dirty & /*items*/ 32) regularoption_changes.options = /*item*/ ctx[10];
    			regularoption.$set(regularoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(regularoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(regularoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(regularoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(32:12) {#if item.type === \\\"reg\\\"}",
    		ctx
    	});

    	return block;
    }

    // (31:8) {#each items as item (item)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[10].type === "reg") return 0;
    		if (/*item*/ ctx[10].type === "sep") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:8) {#each items as item (item)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let main_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[10];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (!src_url_equal(img0.src, img0_src_value = /*imageURI*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", /*alt*/ ctx[1]);
    			attr_dev(img0, "class", "svelte-1ay3at9");
    			add_location(img0, file$3, 26, 4, 835);
    			attr_dev(img1, "class", "more-options svelte-1ay3at9");
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/icons/chevron-down.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$3, 27, 4, 870);

    			attr_dev(div, "class", div_class_value = "optionContainer " + (/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? ""
    			: "hidden") + " svelte-1ay3at9");

    			add_location(div, file$3, 29, 4, 947);
    			attr_dev(main, "title", /*alt*/ ctx[1]);

    			attr_dev(main, "class", main_class_value = "" + ((/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? "highlight"
    			: "") + " " + (/*evenSpacing*/ ctx[6] ? "evenly-spaced" : "") + " svelte-1ay3at9"));

    			add_location(main, file$3, 24, 0, 645);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img0);
    			append_dev(main, t0);
    			append_dev(main, img1);
    			append_dev(main, t1);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(main, "mouseup", /*toggleDropdown*/ ctx[7], false, false, false),
    					listen_dev(main, "mouseenter", /*updateCurrentID*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*imageURI*/ 1 && !src_url_equal(img0.src, img0_src_value = /*imageURI*/ ctx[0])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty & /*alt*/ 2) {
    				attr_dev(img0, "alt", /*alt*/ ctx[1]);
    			}

    			if (dirty & /*items*/ 32) {
    				each_value = /*items*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*active, id, currentID*/ 28 && div_class_value !== (div_class_value = "optionContainer " + (/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? ""
    			: "hidden") + " svelte-1ay3at9")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*alt*/ 2) {
    				attr_dev(main, "title", /*alt*/ ctx[1]);
    			}

    			if (!current || dirty & /*active, id, currentID, evenSpacing*/ 92 && main_class_value !== (main_class_value = "" + ((/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? "highlight"
    			: "") + " " + (/*evenSpacing*/ ctx[6] ? "evenly-spaced" : "") + " svelte-1ay3at9"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DropdownControl', slots, []);
    	const disp = createEventDispatcher();
    	let { imageURI } = $$props;
    	let { alt } = $$props;
    	let { active } = $$props;
    	let { currentID } = $$props;
    	let { id } = $$props;
    	let { items } = $$props;
    	let { evenSpacing = false } = $$props;

    	const toggleDropdown = () => {
    		disp("toggleDropdown");
    	};

    	const updateCurrentID = () => {
    		disp("updateCurrentID", { newID: id });
    	};

    	const writable_props = ['imageURI', 'alt', 'active', 'currentID', 'id', 'items', 'evenSpacing'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DropdownControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('currentID' in $$props) $$invalidate(3, currentID = $$props.currentID);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('evenSpacing' in $$props) $$invalidate(6, evenSpacing = $$props.evenSpacing);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		RegularOption,
    		Separator,
    		disp,
    		imageURI,
    		alt,
    		active,
    		currentID,
    		id,
    		items,
    		evenSpacing,
    		toggleDropdown,
    		updateCurrentID
    	});

    	$$self.$inject_state = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('currentID' in $$props) $$invalidate(3, currentID = $$props.currentID);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('evenSpacing' in $$props) $$invalidate(6, evenSpacing = $$props.evenSpacing);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		imageURI,
    		alt,
    		active,
    		currentID,
    		id,
    		items,
    		evenSpacing,
    		toggleDropdown,
    		updateCurrentID
    	];
    }

    class DropdownControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			imageURI: 0,
    			alt: 1,
    			active: 2,
    			currentID: 3,
    			id: 4,
    			items: 5,
    			evenSpacing: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropdownControl",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imageURI*/ ctx[0] === undefined && !('imageURI' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'imageURI'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !('alt' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'alt'");
    		}

    		if (/*active*/ ctx[2] === undefined && !('active' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'active'");
    		}

    		if (/*currentID*/ ctx[3] === undefined && !('currentID' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'currentID'");
    		}

    		if (/*id*/ ctx[4] === undefined && !('id' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'id'");
    		}

    		if (/*items*/ ctx[5] === undefined && !('items' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'items'");
    		}
    	}

    	get imageURI() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageURI(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentID() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentID(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get evenSpacing() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set evenSpacing(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenus/TopMenu.svelte generated by Svelte v3.48.0 */
    const file$2 = "src/comp/ctrlMenus/TopMenu.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let section1;
    	let dropdowncontrol;
    	let t0;
    	let section0;
    	let filenameeditor;
    	let t1;
    	let div;
    	let t2;
    	let generalappcontrol;
    	let current;

    	const dropdowncontrol_spread_levels = [
    		{ imageURI: "./assets/icons/plus.svg" },
    		{ alt: "Add element" },
    		{ id: "addElement" },
    		{ items: addMenuItems },
    		/*dropdownStatus*/ ctx[2],
    		{ evenSpacing: true }
    	];

    	let dropdowncontrol_props = {};

    	for (let i = 0; i < dropdowncontrol_spread_levels.length; i += 1) {
    		dropdowncontrol_props = assign(dropdowncontrol_props, dropdowncontrol_spread_levels[i]);
    	}

    	dropdowncontrol = new DropdownControl({
    			props: dropdowncontrol_props,
    			$$inline: true
    		});

    	dropdowncontrol.$on("toggleDropdown", /*toggleDropdown*/ ctx[4]);
    	dropdowncontrol.$on("updateCurrentID", /*updateCurrentID*/ ctx[5]);

    	filenameeditor = new FileNameEditor({
    			props: {
    				leftMenuWidth: /*leftMenuWidth*/ ctx[0],
    				controlSectionWidth: /*appControlContWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	generalappcontrol = new GeneralAppControl({
    			props: {
    				dropdownStatus: /*dropdownStatus*/ ctx[2]
    			},
    			$$inline: true
    		});

    	generalappcontrol.$on("widthChange", /*appCtrlContWidthChange*/ ctx[3]);
    	generalappcontrol.$on("toggleDropdown", /*toggleDropdown*/ ctx[4]);
    	generalappcontrol.$on("updateCurrentID", /*updateCurrentID*/ ctx[5]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section1 = element("section");
    			create_component(dropdowncontrol.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			create_component(filenameeditor.$$.fragment);
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			create_component(generalappcontrol.$$.fragment);
    			attr_dev(div, "id", "fileNameGrad");
    			attr_dev(div, "class", "svelte-1fkryy");
    			add_location(div, file$2, 189, 12, 5497);
    			attr_dev(section0, "class", "svelte-1fkryy");
    			add_location(section0, file$2, 187, 8, 5373);
    			attr_dev(section1, "id", "left-ctrl");
    			attr_dev(section1, "class", "svelte-1fkryy");
    			add_location(section1, file$2, 184, 4, 5107);
    			set_style(main, "width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px)");
    			set_style(main, "left", /*leftMenuWidth*/ ctx[0] + "px");
    			attr_dev(main, "class", "svelte-1fkryy");
    			add_location(main, file$2, 182, 0, 5000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			mount_component(dropdowncontrol, section1, null);
    			append_dev(section1, t0);
    			append_dev(section1, section0);
    			mount_component(filenameeditor, section0, null);
    			append_dev(section0, t1);
    			append_dev(section0, div);
    			append_dev(main, t2);
    			mount_component(generalappcontrol, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dropdowncontrol_changes = (dirty & /*addMenuItems, dropdownStatus*/ 4)
    			? get_spread_update(dropdowncontrol_spread_levels, [
    					dropdowncontrol_spread_levels[0],
    					dropdowncontrol_spread_levels[1],
    					dropdowncontrol_spread_levels[2],
    					dirty & /*addMenuItems*/ 0 && { items: addMenuItems },
    					dirty & /*dropdownStatus*/ 4 && get_spread_object(/*dropdownStatus*/ ctx[2]),
    					dropdowncontrol_spread_levels[5]
    				])
    			: {};

    			dropdowncontrol.$set(dropdowncontrol_changes);
    			const filenameeditor_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) filenameeditor_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			if (dirty & /*appControlContWidth*/ 2) filenameeditor_changes.controlSectionWidth = /*appControlContWidth*/ ctx[1];
    			filenameeditor.$set(filenameeditor_changes);
    			const generalappcontrol_changes = {};
    			if (dirty & /*dropdownStatus*/ 4) generalappcontrol_changes.dropdownStatus = /*dropdownStatus*/ ctx[2];
    			generalappcontrol.$set(generalappcontrol_changes);

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px)");
    			}

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "left", /*leftMenuWidth*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdowncontrol.$$.fragment, local);
    			transition_in(filenameeditor.$$.fragment, local);
    			transition_in(generalappcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdowncontrol.$$.fragment, local);
    			transition_out(filenameeditor.$$.fragment, local);
    			transition_out(generalappcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(dropdowncontrol);
    			destroy_component(filenameeditor);
    			destroy_component(generalappcontrol);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let addMenuItems = [
    	{
    		type: "reg",
    		title: HTMltagInfo["DIV"].name,
    		iconSrc: HTMltagInfo["DIV"].iconURI,
    		desc: "<div>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["SECTION"].name,
    		iconSrc: HTMltagInfo["SECTION"].iconURI,
    		desc: "<section>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["SPAN"].name,
    		iconSrc: HTMltagInfo["SPAN"].iconURI,
    		desc: "<span>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["BODY"].name,
    		iconSrc: HTMltagInfo["BODY"].iconURI,
    		desc: "<body>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["CANVAS"].name,
    		iconSrc: HTMltagInfo["CANVAS"].iconURI,
    		desc: "<canvas>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H1"].name,
    		iconSrc: HTMltagInfo["H1"].iconURI,
    		desc: "<h1>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H2"].name,
    		iconSrc: HTMltagInfo["H2"].iconURI,
    		desc: "<h2>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H3"].name,
    		iconSrc: HTMltagInfo["H3"].iconURI,
    		desc: "<h3>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H4"].name,
    		iconSrc: HTMltagInfo["H4"].iconURI,
    		desc: "<h4>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H5"].name,
    		iconSrc: HTMltagInfo["H5"].iconURI,
    		desc: "<h5>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H6"].name,
    		iconSrc: HTMltagInfo["H6"].iconURI,
    		desc: "<h6>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["P"].name,
    		iconSrc: HTMltagInfo["P"].iconURI,
    		desc: "<p>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["A"].name,
    		iconSrc: HTMltagInfo["A"].iconURI,
    		desc: "<a>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["BUTTON"].name,
    		iconSrc: HTMltagInfo["BUTTON"].iconURI,
    		desc: "<button>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["INPUT"].name,
    		iconSrc: HTMltagInfo["INPUT"].iconURI,
    		desc: "<input>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["TEXTAREA"].name,
    		iconSrc: HTMltagInfo["TEXTAREA"].iconURI,
    		desc: "<textarea>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["LABEL"].name,
    		iconSrc: HTMltagInfo["LABEL"].iconURI,
    		desc: "<label>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["OL"].name,
    		iconSrc: HTMltagInfo["OL"].iconURI,
    		desc: "<ol>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["UL"].name,
    		iconSrc: HTMltagInfo["UL"].iconURI,
    		desc: "<ul>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["HR"].name,
    		iconSrc: HTMltagInfo["HR"].iconURI,
    		desc: "<hr>",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["PROGRESS"].name,
    		iconSrc: HTMltagInfo["PROGRESS"].iconURI,
    		desc: "<progress>",
    		cta: () => {
    			
    		}
    	}
    ];

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopMenu', slots, []);
    	let { leftMenuWidth } = $$props;
    	let appControlContWidth = 0;

    	const appCtrlContWidthChange = evt => {
    		$$invalidate(1, appControlContWidth = evt.detail.width);
    	};

    	// dropdown control stuff
    	let dropdownStatus = { currentID: "", active: false };

    	const toggleDropdown = () => {
    		$$invalidate(2, dropdownStatus.active = !dropdownStatus.active, dropdownStatus);

    		// reset global mouse down
    		document.onmouseup = undefined;

    		// if active, set global mouseup so that any click outside of the box will togggle again. Give it a bit of delay so it works
    		setTimeout(
    			() => {
    				if (dropdownStatus.active) {
    					document.onmouseup = () => {
    						$$invalidate(2, dropdownStatus.active = false, dropdownStatus);
    					};

    					return;
    				}
    			},
    			10
    		);
    	};

    	const updateCurrentID = evt => {
    		$$invalidate(2, dropdownStatus.currentID = evt.detail.newID, dropdownStatus);
    	};

    	const writable_props = ['leftMenuWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    	};

    	$$self.$capture_state = () => ({
    		HTMltagInfo,
    		addMenuItems,
    		FileNameEditor,
    		GeneralAppControl,
    		DropdownControl,
    		leftMenuWidth,
    		appControlContWidth,
    		appCtrlContWidthChange,
    		dropdownStatus,
    		toggleDropdown,
    		updateCurrentID
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('appControlContWidth' in $$props) $$invalidate(1, appControlContWidth = $$props.appControlContWidth);
    		if ('dropdownStatus' in $$props) $$invalidate(2, dropdownStatus = $$props.dropdownStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		leftMenuWidth,
    		appControlContWidth,
    		dropdownStatus,
    		appCtrlContWidthChange,
    		toggleDropdown,
    		updateCurrentID
    	];
    }

    class TopMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { leftMenuWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopMenu",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*leftMenuWidth*/ ctx[0] === undefined && !('leftMenuWidth' in props)) {
    			console.warn("<TopMenu> was created without expected prop 'leftMenuWidth'");
    		}
    	}

    	get leftMenuWidth() {
    		throw new Error("<TopMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftMenuWidth(value) {
    		throw new Error("<TopMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/display/MainDisplay.svelte generated by Svelte v3.48.0 */

    const file$1 = "src/comp/display/MainDisplay.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let section;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "id", "knob");
    			attr_dev(div0, "class", "svelte-tkm1mb");
    			add_location(div0, file$1, 8, 3, 246);
    			attr_dev(div1, "id", "bar");
    			attr_dev(div1, "class", "svelte-tkm1mb");
    			add_location(div1, file$1, 7, 2, 228);
    			attr_dev(section, "id", "index-load");
    			attr_dev(section, "class", "svelte-tkm1mb");
    			add_location(section, file$1, 6, 1, 200);
    			set_style(main, "width", "calc(100vw - " + (/*leftMenuWidth*/ ctx[0] - 1) + "px - " + /*rightMenuWidth*/ ctx[1] + "px)");
    			set_style(main, "left", /*leftMenuWidth*/ ctx[0] + 1 + "px");
    			attr_dev(main, "class", "svelte-tkm1mb");
    			add_location(main, file$1, 5, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*leftMenuWidth, rightMenuWidth*/ 3) {
    				set_style(main, "width", "calc(100vw - " + (/*leftMenuWidth*/ ctx[0] - 1) + "px - " + /*rightMenuWidth*/ ctx[1] + "px)");
    			}

    			if (dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "left", /*leftMenuWidth*/ ctx[0] + 1 + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainDisplay', slots, []);
    	let { leftMenuWidth } = $$props;
    	let { rightMenuWidth } = $$props;
    	const writable_props = ['leftMenuWidth', 'rightMenuWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('rightMenuWidth' in $$props) $$invalidate(1, rightMenuWidth = $$props.rightMenuWidth);
    	};

    	$$self.$capture_state = () => ({ leftMenuWidth, rightMenuWidth });

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('rightMenuWidth' in $$props) $$invalidate(1, rightMenuWidth = $$props.rightMenuWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leftMenuWidth, rightMenuWidth];
    }

    class MainDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { leftMenuWidth: 0, rightMenuWidth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainDisplay",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*leftMenuWidth*/ ctx[0] === undefined && !('leftMenuWidth' in props)) {
    			console.warn("<MainDisplay> was created without expected prop 'leftMenuWidth'");
    		}

    		if (/*rightMenuWidth*/ ctx[1] === undefined && !('rightMenuWidth' in props)) {
    			console.warn("<MainDisplay> was created without expected prop 'rightMenuWidth'");
    		}
    	}

    	get leftMenuWidth() {
    		throw new Error("<MainDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftMenuWidth(value) {
    		throw new Error("<MainDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rightMenuWidth() {
    		throw new Error("<MainDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rightMenuWidth(value) {
    		throw new Error("<MainDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.48.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let leftmenu;
    	let t0;
    	let topmenu;
    	let t1;
    	let rightmenu;
    	let t2;
    	let maindisplay;
    	let current;
    	leftmenu = new LeftMenu({ $$inline: true });
    	leftmenu.$on("widthChange", /*leftMenuWidthChange*/ ctx[2]);

    	topmenu = new TopMenu({
    			props: { leftMenuWidth: /*leftMenuWidth*/ ctx[0] },
    			$$inline: true
    		});

    	rightmenu = new RightMenu({ $$inline: true });
    	rightmenu.$on("widthChange", /*rightMenuWidthChange*/ ctx[3]);

    	maindisplay = new MainDisplay({
    			props: {
    				leftMenuWidth: /*leftMenuWidth*/ ctx[0],
    				rightMenuWidth: /*rightMenuWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(leftmenu.$$.fragment);
    			t0 = space();
    			create_component(topmenu.$$.fragment);
    			t1 = space();
    			create_component(rightmenu.$$.fragment);
    			t2 = space();
    			create_component(maindisplay.$$.fragment);
    			attr_dev(main, "class", "svelte-1j0kdkv");
    			add_location(main, file, 14, 0, 474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(leftmenu, main, null);
    			append_dev(main, t0);
    			mount_component(topmenu, main, null);
    			append_dev(main, t1);
    			mount_component(rightmenu, main, null);
    			append_dev(main, t2);
    			mount_component(maindisplay, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topmenu_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) topmenu_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			topmenu.$set(topmenu_changes);
    			const maindisplay_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) maindisplay_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			if (dirty & /*rightMenuWidth*/ 2) maindisplay_changes.rightMenuWidth = /*rightMenuWidth*/ ctx[1];
    			maindisplay.$set(maindisplay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leftmenu.$$.fragment, local);
    			transition_in(topmenu.$$.fragment, local);
    			transition_in(rightmenu.$$.fragment, local);
    			transition_in(maindisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leftmenu.$$.fragment, local);
    			transition_out(topmenu.$$.fragment, local);
    			transition_out(rightmenu.$$.fragment, local);
    			transition_out(maindisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(leftmenu);
    			destroy_component(topmenu);
    			destroy_component(rightmenu);
    			destroy_component(maindisplay);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let leftMenuWidth = 260;

    	const leftMenuWidthChange = evt => {
    		$$invalidate(0, leftMenuWidth = evt.detail.width);
    	};

    	let rightMenuWidth = 360;

    	const rightMenuWidthChange = evt => {
    		$$invalidate(1, rightMenuWidth = evt.detail.width);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LeftMenu,
    		RightMenu,
    		TopMenu,
    		MainDisplay,
    		leftMenuWidth,
    		leftMenuWidthChange,
    		rightMenuWidth,
    		rightMenuWidthChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('rightMenuWidth' in $$props) $$invalidate(1, rightMenuWidth = $$props.rightMenuWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leftMenuWidth, rightMenuWidth, leftMenuWidthChange, rightMenuWidthChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });
    const init_comp = async () => {
        // TODO: stuff	
    };
    window.onload = () => {
        console.log("webview loaded!");
        init_comp(); // asynchronously initialize all components
    };

    return app;

})();
//# sourceMappingURL=bundle.js.map
