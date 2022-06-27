
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
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
    const outroing = new Set();
    let outros;
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

    let currentView = writable("edit");

    /* src/comp/controls/MultiToggle.svelte generated by Svelte v3.48.0 */

    const file$b = "src/comp/controls/MultiToggle.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (29:8) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*ele*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*ele*/ ctx[12].iconDir)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*ele*/ ctx[12].alt);
    			attr_dev(img, "class", "svelte-jl85h2");
    			add_location(img, file$b, 30, 16, 1211);
    			attr_dev(div, "class", "toggle-element svelte-jl85h2");
    			set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			add_location(div, file$b, 29, 12, 1066);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(29:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:8) {#if $store === ele.storeIdentifier}
    function create_if_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*ele*/ ctx[12].iconDir)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*ele*/ ctx[12].alt);
    			attr_dev(img, "class", "selected svelte-jl85h2");
    			add_location(img, file$b, 26, 16, 964);
    			attr_dev(div, "class", "toggle-element svelte-jl85h2");
    			set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			add_location(div, file$b, 25, 12, 836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    			/*div_binding*/ ctx[8](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*elements*/ 1 && !src_url_equal(img.src, img_src_value = /*ele*/ ctx[12].iconDir)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*elements*/ 1 && img_alt_value !== (img_alt_value = /*ele*/ ctx[12].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*containerWidth, elements*/ 3) {
    				set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(24:8) {#if $store === ele.storeIdentifier}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#each elements as ele}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$store*/ ctx[6] === /*ele*/ ctx[12].storeIdentifier) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
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
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:4) {#each elements as ele}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let t;
    	let div;
    	let each_value = /*elements*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "selector svelte-jl85h2");
    			set_style(div, "width", /*containerWidth*/ ctx[1] / /*elements*/ ctx[0].length + "px");
    			add_location(div, file$b, 36, 4, 1325);
    			set_style(main, "width", /*containerWidth*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-jl85h2");
    			add_location(main, file$b, 21, 0, 611);
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
    			/*div_binding_1*/ ctx[10](div);
    			/*main_binding*/ ctx[11](main);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*containerWidth, elements, correspondedElement, $store, updateView*/ 211) {
    				each_value = /*elements*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    			/*div_binding_1*/ ctx[10](null);
    			/*main_binding*/ ctx[11](null);
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
    	let $store,
    		$$unsubscribe_store = noop,
    		$$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, $$value => $$invalidate(6, $store = $$value)), store);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_store());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MultiToggle', slots, []);
    	let { elements } = $$props;
    	let { containerWidth } = $$props;
    	let { store } = $$props;
    	validate_store(store, 'store');
    	$$subscribe_store();
    	let containerElement;
    	let correspondedElement;
    	let selector;

    	const updateView = storeIdentifier => {
    		set_store_value(store, $store = storeIdentifier, $store);
    	};

    	const writable_props = ['elements', 'containerWidth', 'store'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MultiToggle> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			correspondedElement = $$value;
    			$$invalidate(4, correspondedElement);
    		});
    	}

    	const click_handler = ele => updateView(ele.storeIdentifier);

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selector = $$value;
    			(($$invalidate(5, selector), $$invalidate(4, correspondedElement)), $$invalidate(3, containerElement));
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
    	};

    	$$self.$capture_state = () => ({
    		elements,
    		containerWidth,
    		store,
    		containerElement,
    		correspondedElement,
    		selector,
    		updateView,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ('elements' in $$props) $$invalidate(0, elements = $$props.elements);
    		if ('containerWidth' in $$props) $$invalidate(1, containerWidth = $$props.containerWidth);
    		if ('store' in $$props) $$subscribe_store($$invalidate(2, store = $$props.store));
    		if ('containerElement' in $$props) $$invalidate(3, containerElement = $$props.containerElement);
    		if ('correspondedElement' in $$props) $$invalidate(4, correspondedElement = $$props.correspondedElement);
    		if ('selector' in $$props) $$invalidate(5, selector = $$props.selector);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*correspondedElement, containerElement*/ 24) {
    			if (!!correspondedElement) {
    				// calculate the positional difference, and set translate3d for the selector (the purple highlight)
    				const posDiff = correspondedElement.getBoundingClientRect().x - containerElement.getBoundingClientRect().x;

    				$$invalidate(5, selector.style.transform = `translate3d(${posDiff}px, 0, 0)`, selector);
    			}
    		}
    	};

    	return [
    		elements,
    		containerWidth,
    		store,
    		containerElement,
    		correspondedElement,
    		selector,
    		$store,
    		updateView,
    		div_binding,
    		click_handler,
    		div_binding_1,
    		main_binding
    	];
    }

    class MultiToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { elements: 0, containerWidth: 1, store: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiToggle",
    			options,
    			id: create_fragment$b.name
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
    }

    /* src/comp/ctrlMenuItems/ViewSwitcher.svelte generated by Svelte v3.48.0 */
    const file$a = "src/comp/ctrlMenuItems/ViewSwitcher.svelte";

    function create_fragment$a(ctx) {
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
    				store: currentView
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
    			add_location(img, file$a, 17, 33, 453);
    			attr_dev(a, "href", "https://google.com");
    			attr_dev(a, "class", "svelte-1nsh9u8");
    			add_location(a, file$a, 17, 4, 424);
    			attr_dev(main, "class", "svelte-1nsh9u8");
    			add_location(main, file$a, 16, 0, 413);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ViewSwitcher', slots, []);

    	const viewToggleElements = [
    		{
    			iconDir: "./assets/icons/cube.svg",
    			storeIdentifier: "edit",
    			alt: "edit"
    		},
    		{
    			iconDir: "./assets/icons/pantone.svg",
    			storeIdentifier: "palette",
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
    		viewToggleElements
    	});

    	return [viewToggleElements];
    }

    class ViewSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewSwitcher",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/comp/ctrlMenus/LeftMenu.svelte generated by Svelte v3.48.0 */
    const file$9 = "src/comp/ctrlMenus/LeftMenu.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let viewswitcher;
    	let t;
    	let div;
    	let current;
    	viewswitcher = new ViewSwitcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(viewswitcher.$$.fragment);
    			t = space();
    			div = element("div");
    			attr_dev(div, "id", "drag-space");
    			attr_dev(div, "class", "svelte-1krrreq");
    			add_location(div, file$9, 30, 4, 989);
    			set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-1krrreq");
    			add_location(main, file$9, 26, 0, 896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(viewswitcher, main, null);
    			append_dev(main, t);
    			append_dev(main, div);
    			/*div_binding*/ ctx[2](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*currentWidth*/ 2) {
    				set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(viewswitcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(viewswitcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(viewswitcher);
    			/*div_binding*/ ctx[2](null);
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

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeftMenu",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/comp/ctrlMenus/RightMenu.svelte generated by Svelte v3.48.0 */
    const file$8 = "src/comp/ctrlMenus/RightMenu.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			attr_dev(div, "id", "drag-space");
    			attr_dev(div, "class", "svelte-1uz0d8o");
    			add_location(div, file$8, 27, 4, 962);
    			set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			attr_dev(main, "class", "svelte-1uz0d8o");
    			add_location(main, file$8, 25, 0, 891);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RightMenu",
    			options,
    			id: create_fragment$8.name
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
    const file$7 = "src/comp/ctrlMenuItems/FileNameEditor.svelte";

    // (34:8) {#if !$fileStat.saved}
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Saving to the cloud...";
    			attr_dev(p, "class", "svelte-jfx4hv");
    			add_location(p, file$7, 34, 12, 1043);
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
    function create_if_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*$fileStat*/ ctx[3].saved) return create_if_block_1;
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
    		id: create_if_block.name,
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
    			attr_dev(p, "class", "svelte-jfx4hv");
    			add_location(p, file$7, 30, 12, 961);
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
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Saving to the cloud...";
    			attr_dev(p, "class", "svelte-jfx4hv");
    			add_location(p, file$7, 28, 12, 903);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(28:8) {#if !$fileStat.saved}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let span;
    	let t0_value = /*$fileStat*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$fileStat*/ ctx[3].alwaysShowSaveStatus) return create_if_block;
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
    			attr_dev(span, "class", "svelte-jfx4hv");
    			add_location(span, file$7, 24, 4, 564);
    			attr_dev(main, "class", "svelte-jfx4hv");
    			add_location(main, file$7, 23, 0, 553);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const paste_handler = e => e.preventDefault();

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { leftMenuWidth: 0, controlSectionWidth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileNameEditor",
    			options,
    			id: create_fragment$7.name
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

    /* src/comp/ctrlMenuItems/GeneralAppControl/DropdownControl.svelte generated by Svelte v3.48.0 */

    const file$6 = "src/comp/ctrlMenuItems/GeneralAppControl/DropdownControl.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let img0;
    	let img0_src_value;
    	let t;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			img0 = element("img");
    			t = space();
    			img1 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = /*imageURI*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", /*alt*/ ctx[1]);
    			attr_dev(img0, "class", "svelte-16mcmc6");
    			add_location(img0, file$6, 6, 4, 132);
    			attr_dev(img1, "class", "more-options svelte-16mcmc6");
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/icons/chevron-down.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$6, 7, 4, 167);
    			attr_dev(main, "title", /*alt*/ ctx[1]);
    			attr_dev(main, "class", "svelte-16mcmc6");
    			add_location(main, file$6, 5, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img0);
    			append_dev(main, t);
    			append_dev(main, img1);

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

    			if (dirty & /*imageURI*/ 1 && !src_url_equal(img0.src, img0_src_value = /*imageURI*/ ctx[0])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img0, "alt", /*alt*/ ctx[1]);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DropdownControl', slots, []);
    	let { imageURI } = $$props;
    	let { alt } = $$props;

    	let { cta = () => {
    		
    	} } = $$props;

    	const writable_props = ['imageURI', 'alt', 'cta'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DropdownControl> was created with unknown prop '${key}'`);
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

    class DropdownControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { imageURI: 0, alt: 1, cta: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropdownControl",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imageURI*/ ctx[0] === undefined && !('imageURI' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'imageURI'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !('alt' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'alt'");
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

    	get cta() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cta(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/comp/ctrlMenuItems/GeneralAppControl/RegularControl.svelte generated by Svelte v3.48.0 */

    const file$5 = "src/comp/ctrlMenuItems/GeneralAppControl/RegularControl.svelte";

    function create_fragment$5(ctx) {
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
    			attr_dev(img, "class", "svelte-1r4xs90");
    			add_location(img, file$5, 6, 4, 132);
    			attr_dev(main, "title", /*alt*/ ctx[1]);
    			attr_dev(main, "class", "svelte-1r4xs90");
    			add_location(main, file$5, 5, 0, 94);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { imageURI: 0, alt: 1, cta: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegularControl",
    			options,
    			id: create_fragment$5.name
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
    const file$4 = "src/comp/ctrlMenuItems/GeneralAppControl/ZoomControl.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(p, "class", "svelte-7gfolq");
    			add_location(p, file$4, 4, 4, 121);
    			attr_dev(img, "class", "more-options svelte-7gfolq");
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/chevron-down.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 8, 4, 191);
    			attr_dev(main, "title", "Canvas zoom");
    			attr_dev(main, "class", "svelte-7gfolq");
    			add_location(main, file$4, 3, 0, 90);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZoomControl",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/comp/ctrlMenuItems/GeneralAppControl.svelte generated by Svelte v3.48.0 */
    const file$3 = "src/comp/ctrlMenuItems/GeneralAppControl.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let t0;
    	let regularcontrol0;
    	let t1;
    	let dropdowncontrol0;
    	let t2;
    	let regularcontrol1;
    	let t3;
    	let zoomcontrol;
    	let t4;
    	let div;
    	let t5;
    	let dropdowncontrol1;
    	let current;

    	regularcontrol0 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/share.svg",
    				alt: "Export"
    			},
    			$$inline: true
    		});

    	dropdowncontrol0 = new DropdownControl({
    			props: {
    				imageURI: "./assets/icons/checkmark-circle-2.svg",
    				alt: "Checklist"
    			},
    			$$inline: true
    		});

    	regularcontrol1 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/sun.svg",
    				alt: "Toggle dark mode"
    			},
    			$$inline: true
    		});

    	zoomcontrol = new ZoomControl({ $$inline: true });

    	dropdowncontrol1 = new DropdownControl({
    			props: {
    				imageURI: "./assets/icons/plus.svg",
    				alt: "Add element"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			t0 = space();
    			create_component(regularcontrol0.$$.fragment);
    			t1 = space();
    			create_component(dropdowncontrol0.$$.fragment);
    			t2 = space();
    			create_component(regularcontrol1.$$.fragment);
    			t3 = space();
    			create_component(zoomcontrol.$$.fragment);
    			t4 = space();
    			div = element("div");
    			t5 = space();
    			create_component(dropdowncontrol1.$$.fragment);
    			attr_dev(img, "id", "pfp");
    			if (!src_url_equal(img.src, img_src_value = "./assets/pngs/testpfp.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1x7csmn");
    			add_location(img, file$3, 16, 4, 575);
    			attr_dev(div, "class", "spacer svelte-1x7csmn");
    			add_location(div, file$3, 31, 4, 1035);
    			attr_dev(main, "class", "svelte-1x7csmn");
    			add_location(main, file$3, 14, 0, 487);
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
    			mount_component(dropdowncontrol0, main, null);
    			append_dev(main, t2);
    			mount_component(regularcontrol1, main, null);
    			append_dev(main, t3);
    			mount_component(zoomcontrol, main, null);
    			append_dev(main, t4);
    			append_dev(main, div);
    			append_dev(main, t5);
    			mount_component(dropdowncontrol1, main, null);
    			/*main_binding*/ ctx[1](main);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(regularcontrol0.$$.fragment, local);
    			transition_in(dropdowncontrol0.$$.fragment, local);
    			transition_in(regularcontrol1.$$.fragment, local);
    			transition_in(zoomcontrol.$$.fragment, local);
    			transition_in(dropdowncontrol1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(regularcontrol0.$$.fragment, local);
    			transition_out(dropdowncontrol0.$$.fragment, local);
    			transition_out(regularcontrol1.$$.fragment, local);
    			transition_out(zoomcontrol.$$.fragment, local);
    			transition_out(dropdowncontrol1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(regularcontrol0);
    			destroy_component(dropdowncontrol0);
    			destroy_component(regularcontrol1);
    			destroy_component(zoomcontrol);
    			destroy_component(dropdowncontrol1);
    			/*main_binding*/ ctx[1](null);
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
    	validate_slots('GeneralAppControl', slots, []);
    	const disp = createEventDispatcher();
    	let mainContainer;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GeneralAppControl> was created with unknown prop '${key}'`);
    	});

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainContainer = $$value;
    			$$invalidate(0, mainContainer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		DropdownControl,
    		RegularControl,
    		ZoomControl,
    		disp,
    		mainContainer
    	});

    	$$self.$inject_state = $$props => {
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

    	return [mainContainer, main_binding];
    }

    class GeneralAppControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeneralAppControl",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/comp/ctrlMenus/TopMenu.svelte generated by Svelte v3.48.0 */
    const file$2 = "src/comp/ctrlMenus/TopMenu.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let section;
    	let filenameeditor;
    	let t0;
    	let div;
    	let t1;
    	let generalappcontrol;
    	let current;

    	filenameeditor = new FileNameEditor({
    			props: {
    				leftMenuWidth: /*leftMenuWidth*/ ctx[0],
    				controlSectionWidth: /*appControlContWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	generalappcontrol = new GeneralAppControl({ $$inline: true });
    	generalappcontrol.$on("widthChange", /*appCtrlContWidthChange*/ ctx[2]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			create_component(filenameeditor.$$.fragment);
    			t0 = space();
    			div = element("div");
    			t1 = space();
    			create_component(generalappcontrol.$$.fragment);
    			attr_dev(div, "id", "fileNameGrad");
    			attr_dev(div, "class", "svelte-175zuo6");
    			add_location(div, file$2, 13, 8, 546);
    			set_style(section, "z-index", "2");
    			attr_dev(section, "class", "svelte-175zuo6");
    			add_location(section, file$2, 11, 4, 412);
    			set_style(main, "width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px)");
    			set_style(main, "left", /*leftMenuWidth*/ ctx[0] + "px");
    			attr_dev(main, "class", "svelte-175zuo6");
    			add_location(main, file$2, 10, 0, 331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			mount_component(filenameeditor, section, null);
    			append_dev(section, t0);
    			append_dev(section, div);
    			append_dev(main, t1);
    			mount_component(generalappcontrol, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const filenameeditor_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) filenameeditor_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			if (dirty & /*appControlContWidth*/ 2) filenameeditor_changes.controlSectionWidth = /*appControlContWidth*/ ctx[1];
    			filenameeditor.$set(filenameeditor_changes);

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px)");
    			}

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "left", /*leftMenuWidth*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filenameeditor.$$.fragment, local);
    			transition_in(generalappcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filenameeditor.$$.fragment, local);
    			transition_out(generalappcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopMenu', slots, []);
    	let { leftMenuWidth } = $$props;
    	let appControlContWidth = 0;

    	const appCtrlContWidthChange = evt => {
    		$$invalidate(1, appControlContWidth = evt.detail.width);
    	};

    	const writable_props = ['leftMenuWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    	};

    	$$self.$capture_state = () => ({
    		FileNameEditor,
    		GeneralAppControl,
    		leftMenuWidth,
    		appControlContWidth,
    		appCtrlContWidthChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('appControlContWidth' in $$props) $$invalidate(1, appControlContWidth = $$props.appControlContWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leftMenuWidth, appControlContWidth, appCtrlContWidthChange];
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
