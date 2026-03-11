(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useUserProductsStore",
    ()=>useUserProductsStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const ALLOWED_SORTS = new Set([
    "featured",
    "name",
    "price-low",
    "price-high"
]);
const initialState = {
    searchQuery: '',
    page: 1,
    limit: 20,
    categoryPage: 1,
    categoryLimit: 8,
    selectedCategoryId: 'all',
    selectedCategoryName: 'All Categories',
    sortBy: "featured",
    showInStock: false,
    products: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
    }
};
const useUserProductsStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        ...initialState,
        initializeSearchQuery: (query)=>{
            if (!query) return;
            set((state)=>state.searchQuery ? state : {
                    searchQuery: query
                });
        },
        initialize: (params = {})=>{
            const sortBy = params.sort && ALLOWED_SORTS.has(params.sort) ? params.sort : initialState.sortBy;
            set({
                searchQuery: params.search ?? initialState.searchQuery,
                selectedCategoryId: params.categoryId ?? initialState.selectedCategoryId,
                selectedCategoryName: params.categoryName ?? initialState.selectedCategoryName,
                page: params.page ?? initialState.page,
                limit: params.limit ?? initialState.limit,
                categoryPage: params.categoryPage ?? initialState.categoryPage,
                categoryLimit: params.categoryLimit ?? initialState.categoryLimit,
                showInStock: params.inStockOnly ?? initialState.showInStock,
                sortBy
            });
        },
        setSearchQuery: (query)=>set({
                searchQuery: query
            }),
        setSelectedCategoryId: (categoryId)=>set({
                selectedCategoryId: categoryId
            }),
        setSortBy: (sortBy)=>set({
                sortBy
            }),
        setShowInStock: (show)=>set({
                showInStock: show
            }),
        setCategoryPage: (page)=>set({
                categoryPage: page
            }),
        setCategoryLimit: (limit)=>set({
                categoryLimit: limit
            }),
        hydrateFromServer: ({ params = {}, products, pagination })=>{
            const sortBy = params.sort && ALLOWED_SORTS.has(params.sort) ? params.sort : initialState.sortBy;
            set({
                searchQuery: params.search ?? initialState.searchQuery,
                selectedCategoryId: params.categoryId ?? initialState.selectedCategoryId,
                selectedCategoryName: params.categoryName ?? initialState.selectedCategoryName,
                page: params.page ?? initialState.page,
                limit: params.limit ?? initialState.limit,
                categoryPage: params.categoryPage ?? initialState.categoryPage,
                categoryLimit: params.categoryLimit ?? initialState.categoryLimit,
                showInStock: params.inStockOnly ?? initialState.showInStock,
                sortBy,
                products,
                pagination
            });
        },
        syncWithUrl: ()=>{
            const state = get();
            const params = new URLSearchParams();
            if (state.selectedCategoryId && state.selectedCategoryId !== 'all') {
                params.append('categoryId', state.selectedCategoryId);
            }
            if (state.searchQuery) {
                params.append('search', state.searchQuery);
            }
            if (state.page !== initialState.page) {
                params.append('page', String(state.page));
            }
            if (state.limit !== initialState.limit) {
                params.append('limit', String(state.limit));
            }
            if (state.sortBy !== initialState.sortBy) {
                params.append('sort', state.sortBy);
            }
            if (state.showInStock) {
                params.append('inStockOnly', 'true');
            }
            return `/products${params.toString() ? '?' + params.toString() : ''}`;
        },
        reset: ()=>set(initialState)
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsSearchBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsSearchBar",
    ()=>ProductsSearchBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function ProductsSearchBar() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsSearchBar.useUserProductsStore[searchQuery]": (state)=>state.searchQuery
    }["ProductsSearchBar.useUserProductsStore[searchQuery]"]);
    const setSearchQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsSearchBar.useUserProductsStore[setSearchQuery]": (state)=>state.setSearchQuery
    }["ProductsSearchBar.useUserProductsStore[setSearchQuery]"]);
    const syncWithUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsSearchBar.useUserProductsStore[syncWithUrl]": (state)=>state.syncWithUrl
    }["ProductsSearchBar.useUserProductsStore[syncWithUrl]"]);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(searchQuery);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductsSearchBar.useEffect": ()=>{
            const timer = setTimeout({
                "ProductsSearchBar.useEffect.timer": ()=>{
                    setSearchQuery(inputValue);
                    const url = syncWithUrl();
                    router.push(url);
                }
            }["ProductsSearchBar.useEffect.timer"], 500); // 500ms debounce
            return ({
                "ProductsSearchBar.useEffect": ()=>clearTimeout(timer)
            })["ProductsSearchBar.useEffect"];
        }
    }["ProductsSearchBar.useEffect"], [
        inputValue,
        setSearchQuery,
        syncWithUrl,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsSearchBar.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                type: "search",
                placeholder: "Search products...",
                value: inputValue,
                onChange: (e)=>setInputValue(e.target.value),
                className: "pl-12 h-12 rounded-full bg-card border-0 shadow-soft pr-9"
            }, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsSearchBar.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsSearchBar.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(ProductsSearchBar, "tZWNTmDX/n0pRQ5p8z7Y5eK6AHY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"]
    ];
});
_c = ProductsSearchBar;
var _c;
__turbopack_context__.k.register(_c, "ProductsSearchBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsFilterBar",
    ()=>ProductsFilterBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$horizontal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SlidersHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.js [app-client] (ecmascript) <export default as SlidersHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function ProductsFilterBar({ filterContent }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const currentSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsFilterBar.useUserProductsStore[currentSort]": (state)=>state.sortBy
    }["ProductsFilterBar.useUserProductsStore[currentSort]"]);
    const setSortBy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsFilterBar.useUserProductsStore[setSortBy]": (state)=>state.setSortBy
    }["ProductsFilterBar.useUserProductsStore[setSortBy]"]);
    const syncWithUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsFilterBar.useUserProductsStore[syncWithUrl]": (state)=>state.syncWithUrl
    }["ProductsFilterBar.useUserProductsStore[syncWithUrl]"]);
    const handleSortChange = (sortValue)=>{
        setSortBy(sortValue);
        const url = syncWithUrl();
        router.push(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sheet"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetTrigger"], {
                        asChild: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            className: "lg:hidden h-12 rounded-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sliders$2d$horizontal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SlidersHorizontal$3e$__["SlidersHorizontal"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                                    lineNumber: 39,
                                    columnNumber: 13
                                }, this),
                                "Filters"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetContent"], {
                        side: "left",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetHeader"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetTitle"], {
                                    children: "Filters"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6",
                                children: filterContent
                            }, void 0, false, {
                                fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: currentSort,
                onChange: (e)=>handleSortChange(e.target.value),
                className: "w-[180px] h-12 rounded-full bg-card border-0 shadow-soft px-4 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "featured",
                        children: "Featured"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "name",
                        children: "Name"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "price-low",
                        children: "Price: Low to High"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "price-high",
                        children: "Price: High to Low"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsFilterBar.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(ProductsFilterBar, "fiLOahlcSgrd2rOG5DxC59rjFpg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"]
    ];
});
_c = ProductsFilterBar;
var _c;
__turbopack_context__.k.register(_c, "ProductsFilterBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsActiveFilters.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsActiveFilters",
    ()=>ProductsActiveFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ProductsActiveFilters() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const selectedCategoryId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsActiveFilters.useUserProductsStore[selectedCategoryId]": (state)=>state.selectedCategoryId
    }["ProductsActiveFilters.useUserProductsStore[selectedCategoryId]"]);
    const selectedCategoryName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsActiveFilters.useUserProductsStore[selectedCategoryName]": (state)=>state.selectedCategoryName
    }["ProductsActiveFilters.useUserProductsStore[selectedCategoryName]"]);
    const showInStock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsActiveFilters.useUserProductsStore[showInStock]": (state)=>state.showInStock
    }["ProductsActiveFilters.useUserProductsStore[showInStock]"]);
    const setSelectedCategoryId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsActiveFilters.useUserProductsStore[setSelectedCategoryId]": (state)=>state.setSelectedCategoryId
    }["ProductsActiveFilters.useUserProductsStore[setSelectedCategoryId]"]);
    const setShowInStock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsActiveFilters.useUserProductsStore[setShowInStock]": (state)=>state.setShowInStock
    }["ProductsActiveFilters.useUserProductsStore[setShowInStock]"]);
    const syncWithUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsActiveFilters.useUserProductsStore[syncWithUrl]": (state)=>state.syncWithUrl
    }["ProductsActiveFilters.useUserProductsStore[syncWithUrl]"]);
    if (selectedCategoryId === "all" && !showInStock) {
        return null;
    }
    const effectiveSelectedCategoryId = selectedCategoryId ?? "all";
    const effectiveShowInStock = showInStock ?? false;
    const handleRemoveCategory = ()=>{
        setSelectedCategoryId("all");
        const url = syncWithUrl();
        router.push(url);
    };
    const handleRemoveStockFilter = ()=>{
        setShowInStock(false);
        const url = syncWithUrl();
        router.push(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-2 mb-6",
        children: [
            effectiveSelectedCategoryId !== "all" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                onClick: handleRemoveCategory,
                className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80",
                children: [
                    selectedCategoryName || "Category",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "ml-1 h-3 w-3"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsActiveFilters.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsActiveFilters.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this),
            effectiveShowInStock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                onClick: handleRemoveStockFilter,
                className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80",
                children: [
                    "In Stock",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        className: "ml-1 h-3 w-3"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsActiveFilters.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsActiveFilters.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsActiveFilters.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(ProductsActiveFilters, "bMb2O6zCAigErHDDbo1R7DdkOp4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"]
    ];
});
_c = ProductsActiveFilters;
var _c;
__turbopack_context__.k.register(_c, "ProductsActiveFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ProductImageWithFallback.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductImageWithFallback",
    ()=>ProductImageWithFallback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const ProductImageWithFallback = ({ src, alt, productName, priority = false, loading = "eager", fill = true, className = "" })=>{
    _s();
    const [imageError, setImageError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (imageError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                    className: "h-16 w-16 text-muted-foreground/60"
                }, void 0, false, {
                    fileName: "[project]/src/components/ProductImageWithFallback.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm font-medium text-muted-foreground text-center px-4 line-clamp-2",
                    children: productName
                }, void 0, false, {
                    fileName: "[project]/src/components/ProductImageWithFallback.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ProductImageWithFallback.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        src: src,
        alt: alt,
        fill: fill,
        className: className,
        priority: priority,
        loading: loading,
        unoptimized: true,
        onError: ()=>setImageError(true)
    }, void 0, false, {
        fileName: "[project]/src/components/ProductImageWithFallback.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ProductImageWithFallback, "gLR0P7wgc8ZXiun/rQPANvAzwwQ=");
_c = ProductImageWithFallback;
var _c;
__turbopack_context__.k.register(_c, "ProductImageWithFallback");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/products/ProductCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useCart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProductImageWithFallback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ProductImageWithFallback.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
function isStoreProduct(product) {
    return "quantity" in product && !("productStores" in product);
}
function ProductCard({ product, discountBadge, bugoBadge }) {
    _s();
    const { data: session } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authClient"].useSession();
    const isLoggedIn = !!session;
    const { addToCart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])({
        autoFetch: false
    });
    const [isAdding, setIsAdding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const formatPrice = (price)=>{
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(price);
    };
    const formatEndsIn = (endsAt)=>{
        if (!endsAt) return "";
        const endDate = new Date(endsAt);
        if (Number.isNaN(endDate.getTime())) return "";
        const formattedDate = new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short"
        }).format(endDate);
        return `, ends ${formattedDate}`;
    };
    // Normalize product data
    const isStoreProductType = isStoreProduct(product);
    const totalStock = isStoreProductType ? product.quantity : product.productStores?.reduce((sum, ps)=>sum + ps.quantity, 0) ?? 0;
    const isOutOfStock = totalStock === 0;
    const originalPrice = isStoreProductType ? product.originalPrice ?? product.price : typeof product.originalPrice === "number" ? product.originalPrice : null;
    const displayPrice = isStoreProductType ? product.finalPrice ?? product.price : product.price;
    const hasDiscount = isStoreProductType ? (product.discountAmount ?? 0) > 0 && originalPrice !== null && originalPrice > displayPrice : originalPrice !== null && originalPrice > displayPrice;
    const discountPercentage = isStoreProductType ? hasDiscount && originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0 : hasDiscount && originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
    let savingsAmount;
    if (isStoreProductType) {
        savingsAmount = product.discountAmount ?? 0;
    } else {
        const productWithDetails = product;
        savingsAmount = typeof productWithDetails.savingsAmount === "number" ? productWithDetails.savingsAmount : hasDiscount && originalPrice !== null ? originalPrice - displayPrice : 0;
    }
    savingsAmount = savingsAmount ?? 0;
    const weightDisplay = isStoreProductType && product.weight ? `${product.weight}g/pcs` : null;
    const getImageUrl = (url)=>{
        if (!url) return "https://placehold.co/400x400?text=No+Image";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const apiBaseUrl = ("TURBOPACK compile-time value", "http://localhost:3001") || "";
        return `${apiBaseUrl}${url}`;
    };
    const primaryImage = isStoreProductType ? product.images[0] || "https://placehold.co/400x400?text=No+Image" : getImageUrl(product.productImages[0]?.url);
    const productName = product.name;
    const productId = product.id;
    const categoryName = isStoreProductType ? product.category : product.category.name;
    const handleAddToCart = async (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info("Please login to add items to cart");
            return;
        }
        if (isOutOfStock) return;
        try {
            setIsAdding(true);
            await addToCart(productId);
        } catch (error) {
            console.error("Add to cart failed:", error);
        } finally{
            setIsAdding(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "card-product group relative flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-medium transition-all duration-300",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: `/products/${productId}`,
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative aspect-square bg-muted/30 overflow-hidden",
                        children: [
                            isOutOfStock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                className: "absolute top-2 left-2 bg-destructive text-destructive-foreground border-0 text-xs z-10",
                                children: "Out of Stock"
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 147,
                                columnNumber: 13
                            }, this),
                            !discountBadge && !bugoBadge && hasDiscount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                className: "absolute top-2 right-2 bg-red-500 text-white border-0 text-xs z-10",
                                children: [
                                    "-",
                                    discountPercentage,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 154,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative h-full w-full",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProductImageWithFallback$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductImageWithFallback"], {
                                    src: primaryImage,
                                    alt: productName,
                                    productName: productName,
                                    fill: true,
                                    className: "object-cover group-hover:scale-110 transition-transform duration-300",
                                    loading: "lazy"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/products/ProductCard.tsx",
                                    lineNumber: 160,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 159,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/products/ProductCard.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-2 w-full px-4 pt-4",
                        children: [
                            discountBadge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap",
                                    style: {
                                        background: "linear-gradient(to right, #ec4899, #db2777)"
                                    },
                                    children: [
                                        discountBadge.label,
                                        formatEndsIn(discountBadge.endsAt)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/products/ProductCard.tsx",
                                    lineNumber: 175,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this),
                            bugoBadge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap",
                                    style: {
                                        background: "linear-gradient(to right, #f97316, #dc2626)"
                                    },
                                    children: [
                                        bugoBadge.label,
                                        formatEndsIn(bugoBadge.endsAt)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/products/ProductCard.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 187,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/products/ProductCard.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 sm:p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide",
                                children: categoryName
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base",
                                children: productName
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this),
                            weightDisplay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] sm:text-xs text-muted-foreground mt-1",
                                children: weightDisplay
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 213,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm sm:text-base font-bold text-primary",
                                        children: formatPrice(displayPrice)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/products/ProductCard.tsx",
                                        lineNumber: 220,
                                        columnNumber: 13
                                    }, this),
                                    hasDiscount && originalPrice !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] sm:text-xs text-muted-foreground line-through",
                                        children: formatPrice(originalPrice)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/products/ProductCard.tsx",
                                        lineNumber: 224,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 219,
                                columnNumber: 11
                            }, this),
                            hasDiscount && savingsAmount > 0 && !isStoreProductType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-green-700 font-medium mt-1",
                                children: [
                                    "You saved ",
                                    formatPrice(savingsAmount)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this),
                            isOutOfStock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] sm:text-xs text-red-500 font-medium mt-1",
                                children: "Out of Stock"
                            }, void 0, false, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 239,
                                columnNumber: 13
                            }, this),
                            !isOutOfStock && totalStock <= 10 && totalStock > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] sm:text-xs text-amber-600 font-medium mt-1",
                                children: [
                                    "Only ",
                                    totalStock,
                                    " left in stock!"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/products/ProductCard.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/products/ProductCard.tsx",
                        lineNumber: 202,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/products/ProductCard.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 sm:px-4 pb-3 sm:pb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    disabled: isOutOfStock || isAdding,
                    size: "sm",
                    className: "w-full h-9 sm:h-10 rounded-full",
                    onClick: handleAddToCart,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "h-4 w-4 mr-1.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/products/ProductCard.tsx",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this),
                        isAdding ? "Adding..." : "Add"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/products/ProductCard.tsx",
                    lineNumber: 253,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/products/ProductCard.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/products/ProductCard.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_s(ProductCard, "3JWuSI2cten4aFznjmmvtSf1mKc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authClient"].useSession,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"]
    ];
});
_c = ProductCard;
var _c;
__turbopack_context__.k.register(_c, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsGrid",
    ()=>ProductsGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$products$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/products/ProductCard.tsx [app-client] (ecmascript)");
;
;
function ProductsGrid({ products }) {
    const uniqueProducts = new Map();
    products.forEach((product)=>{
        if (!uniqueProducts.has(product.id)) {
            uniqueProducts.set(product.id, product);
        }
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
        children: Array.from(uniqueProducts.values()).map((product)=>{
            const discountBadge = product.discountedPricing && product.discountedPricing.appliedCount > 0 ? {
                label: product.discountedPricing.appliedCount > 1 ? `${product.discountedPricing.appliedCount} discounts applied` : product.discountedPricing.appliedDiscounts[0]?.label || `${Math.round(product.discountedPricing.totalDiscount / product.price * 100)}% off`,
                endsAt: product.discountedPricing.earliestEndsAt
            } : undefined;
            const bugoBadge = product.discountedPricing?.quantityDiscounts && product.discountedPricing.quantityDiscounts.length > 0 ? {
                label: product.discountedPricing.quantityDiscounts.length > 1 ? `${product.discountedPricing.quantityDiscounts.length} BXGY offers` : `Buy ${product.discountedPricing.quantityDiscounts[0].buyQuantity} get ${product.discountedPricing.quantityDiscounts[0].freeQuantity} free`,
                endsAt: product.discountedPricing.quantityDiscounts[0].endsAt
            } : undefined;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$products$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductCard"], {
                product: {
                    ...product,
                    price: product.discountedPricing?.discountedPrice || product.price,
                    originalPrice: product.discountedPricing?.discountedPrice ? product.price : undefined,
                    savingsAmount: product.discountedPricing?.totalDiscount
                },
                discountBadge: discountBadge,
                bugoBadge: bugoBadge
            }, product.id, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsGrid.tsx",
                lineNumber: 41,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsGrid.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = ProductsGrid;
var _c;
__turbopack_context__.k.register(_c, "ProductsGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsPagination.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsPagination",
    ()=>ProductsPagination
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function ProductsPagination() {
    _s();
    const pagination = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsPagination.useUserProductsStore[pagination]": (state)=>state.pagination
    }["ProductsPagination.useUserProductsStore[pagination]"]);
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const preservedParams = Array.from(searchParams.entries()).filter(([key])=>key !== "page");
    if (pagination.totalPages <= 1) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-8 flex items-center justify-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                method: "GET",
                action: "/products",
                className: "inline",
                children: [
                    preservedParams.map(([key, value], index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "hidden",
                            name: key,
                            value: value
                        }, `prev-${key}-${value}-${index}`, false, {
                            fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                            lineNumber: 20,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        name: "page",
                        value: Math.max(1, pagination.page - 1).toString(),
                        disabled: pagination.page === 1,
                        className: "inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium bg-card border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                className: "h-4 w-4 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            "Previous"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1",
                children: Array.from({
                    length: pagination.totalPages
                }, (_, i)=>i + 1).filter((page)=>{
                    return page === 1 || page === pagination.totalPages || page >= pagination.page - 1 && page <= pagination.page + 1;
                }).map((page, index, array)=>{
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            showEllipsis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 text-muted-foreground",
                                children: "..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                                lineNumber: 55,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                method: "GET",
                                action: "/products",
                                className: "inline",
                                children: [
                                    preservedParams.map(([key, value], hiddenIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "hidden",
                                            name: key,
                                            value: value
                                        }, `page-${page}-${key}-${value}-${hiddenIndex}`, false, {
                                            fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                                            lineNumber: 59,
                                            columnNumber: 21
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        name: "page",
                                        value: page.toString(),
                                        className: `inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium w-10 h-10 ${pagination.page === page ? "bg-primary text-primary-foreground" : "bg-card border border-input hover:bg-muted"}`,
                                        children: page
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                                        lineNumber: 66,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                                lineNumber: 57,
                                columnNumber: 17
                            }, this)
                        ]
                    }, page, true, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                        lineNumber: 53,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                method: "GET",
                action: "/products",
                className: "inline",
                children: [
                    preservedParams.map(([key, value], index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "hidden",
                            name: key,
                            value: value
                        }, `next-${key}-${value}-${index}`, false, {
                            fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        name: "page",
                        value: Math.min(pagination.totalPages, pagination.page + 1).toString(),
                        disabled: pagination.page === pagination.totalPages,
                        className: "inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium bg-card border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
                        children: [
                            "Next",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "h-4 w-4 ml-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsPagination.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(ProductsPagination, "ohLVfYFjYitAuV3bnBsL18zXy/M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = ProductsPagination;
var _c;
__turbopack_context__.k.register(_c, "ProductsPagination");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsDisplay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsDisplay",
    ()=>ProductsDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$user$292f$products$2f$_components$2f$ProductsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(user)/products/_components/ProductsGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$user$292f$products$2f$_components$2f$ProductsPagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(user)/products/_components/ProductsPagination.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ProductsDisplay() {
    _s();
    const products = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsDisplay.useUserProductsStore[products]": (state)=>state.products
    }["ProductsDisplay.useUserProductsStore[products]"]);
    if (products.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-16",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-6xl mb-4",
                    children: "🔍"
                }, void 0, false, {
                    fileName: "[project]/src/app/(user)/products/_components/ProductsDisplay.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-semibold mb-2",
                    children: "No products found"
                }, void 0, false, {
                    fileName: "[project]/src/app/(user)/products/_components/ProductsDisplay.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted-foreground",
                    children: "Try adjusting your search or filters"
                }, void 0, false, {
                    fileName: "[project]/src/app/(user)/products/_components/ProductsDisplay.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(user)/products/_components/ProductsDisplay.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$user$292f$products$2f$_components$2f$ProductsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductsGrid"], {
                products: products
            }, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsDisplay.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$user$292f$products$2f$_components$2f$ProductsPagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductsPagination"], {}, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsDisplay.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(ProductsDisplay, "lDz5bnx9pfCytPPOk0FsLPfgerA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"]
    ];
});
_c = ProductsDisplay;
var _c;
__turbopack_context__.k.register(_c, "ProductsDisplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsCategoryPagination",
    ()=>ProductsCategoryPagination
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ProductsCategoryPagination({ currentPage, totalPages }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const setCategoryPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsCategoryPagination.useUserProductsStore[setCategoryPage]": (state)=>state.setCategoryPage
    }["ProductsCategoryPagination.useUserProductsStore[setCategoryPage]"]);
    const handlePrevPage = ()=>{
        const nextPage = Math.max(1, currentPage - 1);
        setCategoryPage(nextPage);
        const params = new URLSearchParams(searchParams.toString());
        params.set("categoryPage", nextPage.toString());
        router.push(`/products?${params.toString()}`);
    };
    const handleNextPage = ()=>{
        const nextPage = Math.min(totalPages, currentPage + 1);
        setCategoryPage(nextPage);
        const params = new URLSearchParams(searchParams.toString());
        params.set("categoryPage", nextPage.toString());
        router.push(`/products?${params.toString()}`);
    };
    if (totalPages <= 1) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-3 flex items-center justify-between",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handlePrevPage,
                disabled: currentPage === 1,
                className: "inline-flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                        className: "h-4 w-4 mr-1"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    "Prev"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-muted-foreground",
                children: [
                    currentPage,
                    "/",
                    totalPages
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleNextPage,
                disabled: currentPage === totalPages,
                className: "inline-flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50",
                children: [
                    "Next",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                        className: "h-4 w-4 ml-1"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsCategoryPagination.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(ProductsCategoryPagination, "2E73qPU+5uSlw1vcOEMXnsQzdAw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"]
    ];
});
_c = ProductsCategoryPagination;
var _c;
__turbopack_context__.k.register(_c, "ProductsCategoryPagination");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/checkbox.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Checkbox",
    ()=>Checkbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-checkbox/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const Checkbox = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center justify-center text-current"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                className: "h-4 w-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/checkbox.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/ui/checkbox.tsx",
            lineNumber: 19,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/checkbox.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Checkbox;
Checkbox.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Checkbox$React.forwardRef");
__turbopack_context__.k.register(_c1, "Checkbox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsInStockOnlyToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsInStockOnlyToggle",
    ()=>ProductsInStockOnlyToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/checkbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ProductsInStockOnlyToggle({ showInStock }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const handleCheckedChange = (checked)=>{
        const nextChecked = checked === true;
        const params = new URLSearchParams(searchParams.toString());
        if (nextChecked) {
            params.set("inStockOnly", "true");
        } else {
            params.delete("inStockOnly");
        }
        // Reset paging when filter changes so user sees first page of new result set.
        params.delete("page");
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "flex items-center gap-2 cursor-pointer",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Checkbox"], {
                checked: showInStock,
                onCheckedChange: handleCheckedChange
            }, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsInStockOnlyToggle.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "In Stock Only"
            }, void 0, false, {
                fileName: "[project]/src/app/(user)/products/_components/ProductsInStockOnlyToggle.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(user)/products/_components/ProductsInStockOnlyToggle.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(ProductsInStockOnlyToggle, "66hrdMMH0WyruZN7frcpeuU7V/k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = ProductsInStockOnlyToggle;
var _c;
__turbopack_context__.k.register(_c, "ProductsInStockOnlyToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(user)/products/_components/ProductsStoreHydrator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductsStoreHydrator",
    ()=>ProductsStoreHydrator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/store/user/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/user/useUserProductsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ProductsStoreHydrator({ selectedCategoryId, selectedCategoryName, showInStock, currentSearch, currentSort, page, limit, categoryPage, categoryLimit, products, pagination }) {
    _s();
    const hydrateFromServer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"])({
        "ProductsStoreHydrator.useUserProductsStore[hydrateFromServer]": (state)=>state.hydrateFromServer
    }["ProductsStoreHydrator.useUserProductsStore[hydrateFromServer]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductsStoreHydrator.useEffect": ()=>{
            hydrateFromServer({
                params: {
                    categoryId: selectedCategoryId,
                    categoryName: selectedCategoryName,
                    inStockOnly: showInStock,
                    search: currentSearch,
                    sort: currentSort,
                    page,
                    limit,
                    categoryPage,
                    categoryLimit
                },
                products,
                pagination
            });
        }
    }["ProductsStoreHydrator.useEffect"], [
        selectedCategoryId,
        selectedCategoryName,
        showInStock,
        currentSearch,
        currentSort,
        page,
        limit,
        categoryPage,
        categoryLimit,
        products,
        pagination,
        hydrateFromServer
    ]);
    return null;
}
_s(ProductsStoreHydrator, "n8T2oiF4CLJ63kmQJU6drZmALZo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$user$2f$useUserProductsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserProductsStore"]
    ];
});
_c = ProductsStoreHydrator;
var _c;
__turbopack_context__.k.register(_c, "ProductsStoreHydrator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_bc264b53._.js.map