import { writable, get } from 'svelte/store';

export type HTMLtag = "A" | "BODY" | "BUTTON" | "CANVAS" | "DIV" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "HR" | "INPUT" | "LABEL" | "OL" | "UL" | "PROGRESS" | "P" | "SECTION" | "SPAN" | "TEXTAREA";
export type units = "px" | "pt" | "pc" | "em" | "rem" | "vw" | "vh" | "%" | "fit-content";
export type borderOutlineStyle = "DOTTED" | "DASHED" | "SOLID" | "DOUBLE" | "GROOVE" | "RIDGE" | "RIDGE" | "INSET" | "OUTSET" | "NONE" | "HIDDEN";
export type typography = "poppins";
export type textAlignment = "center" | "left" | "right" | "justify";
export type textTransform = "uppercase" | "lowercase" | "capitalize";
export type overflow = "visible" | "hidden" | "scroll"


export interface tagInfo{
    name : string,
    iconURI : string
}
export const HTMltagInfo: Record<HTMLtag, tagInfo> = {
    "A"         : {"name" : "Anchor", "iconURI" : "./assets/icons/link.svg"},
    "BODY"      : {"name" : "Document body", "iconURI" : "./assets/icons/browser.svg"},
    "BUTTON"    : {"name" : "Button", "iconURI" : "./assets/icons/play-circle.svg"},
    "CANVAS"    : {"name" : "Canvas", "iconURI" : "./assets/icons/canvas.svg"},
    "DIV"       : {"name" : "Division", "iconURI" : "./assets/icons/grid.svg"},
    "H1"        : {"name" : "Heading 1", "iconURI" : "./assets/icons/heading.svg"},
    "H2"        : {"name" : "Heading 2", "iconURI" : "./assets/icons/heading.svg"},
    "H3"        : {"name" : "Heading 3", "iconURI" : "./assets/icons/heading.svg"},
    "H4"        : {"name" : "Heading 4", "iconURI" : "./assets/icons/heading.svg"},
    "H5"        : {"name" : "Heading 5", "iconURI" : "./assets/icons/heading.svg"},
    "H6"        : {"name" : "Heading 6", "iconURI" : "./assets/icons/heading.svg"},
    "HR"        : {"name" : "Horizontal line", "iconURI" : "./assets/icons/minus.svg"},
    "INPUT"     : {"name" : "Input", "iconURI" : "./assets/icons/globe.svg"},
    "LABEL"     : {"name" : "Label", "iconURI" : "./assets/icons/pricetags.svg"},
    "OL"        : {"name" : "Organized list", "iconURI" : "./assets/icons/list.svg"},
    "UL"        : {"name" : "Unorganized list", "iconURI" : "./assets/icons/menu.svg"},
    "PROGRESS"  : {"name" : "Progress", "iconURI" : "./assets/icons/clock.svg"},
    "P"         : {"name" : "Paragraph", "iconURI" : "./assets/icons/paragraph.svg"},
    "SECTION"   : {"name" : "Paragraph", "iconURI" : "./assets/icons/layout.svg"},
    "SPAN"      : {"name" : "Span", "iconURI" : "./assets/icons/flash.svg"},
    "TEXTAREA"  : {"name" : "Textarea", "iconURI" : "./assets/icons/edit-2.svg"},
}

export interface unitedAttr<T>{
    name : T,
    unit : units
}

export interface numberRange{
    low : 0,
    high : 100
}

export interface shadow{
    radius : unitedAttr<number>,
    x : unitedAttr<number>,
    y : unitedAttr<number>,
    color : string
} export interface boxShadow {
    base : shadow,
    grow : unitedAttr<number>,
    inset : boolean
}

export interface elementStyle{
    backgroundColor : string,
    opacity : number,
    boxShadows : boxShadow[],
    overflowX : overflow,
    overflowY : overflow,

    borderWidthTop : unitedAttr<number>,
    borderWidthRight : unitedAttr<number>,
    borderWidthBottom : unitedAttr<number>,
    borderWidthLeft : unitedAttr<number>,
    borderColor : string,
    borderStyle : borderOutlineStyle,
    borderRadius : unitedAttr<number>,

    marginTop : unitedAttr<number>,
    marginRight : unitedAttr<number>,
    marginBottom : unitedAttr<number>,
    marginLeft : unitedAttr<number>,

    paddingTop : unitedAttr<number>,
    paddingRight : unitedAttr<number>,
    paddingBottom : unitedAttr<number>,
    paddingLeft : unitedAttr<number>,

    height : unitedAttr<number>,
    width : unitedAttr<number>,

    outlineWidth : unitedAttr<number>,
    outlineColor : string,
    outlineStyle : borderOutlineStyle,
    outlineRadius : unitedAttr<number>,
    outlineOffset : unitedAttr<number>,

    fontFamily : typography,
    fontWeight : numberRange,
    fontSize : unitedAttr<number>,
    lineHeight : unitedAttr<number>,
    letterSpacing : unitedAttr<number>,
    color : string,
    textAlign : textAlignment,
    textTranform : textTransform,
    textShadows : shadow[],

    content : string,
    placeholder : string,

    translateX : unitedAttr<number>,
    translateY : unitedAttr<number>,
    scaleX : number,
    scaleY : number,  
};

export interface override{
    name : string,
	style? : elementStyle
};

export interface element{
    type : HTMLtag,
    showing: boolean,
    style? : elementStyle
    styleOverrides? : override[]
};

export let collection = writable<element[]>([
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