
function parse(xml: string): string {
  const result = parseNodes(xml, []).children;
  return result[0] ? result.toString() : "";
}

class MyNode {
  tag: string;
  children: MyNode[];
  constructor(tag: string, children: MyNode[]){
    this.tag = tag;
    this.children = children;
  }

  toString(): string {
    const childNodes = this.children.map((c: MyNode) => c.toString()).join("");
    return `${this.tag}(${childNodes})`;
  }
}

function getNextTag(xml: string): {tag: string, type: string} {
  const open = xml.match(/^<([A-Za-z\-_]*)>/);
  const close = xml.match(/^<\/([A-Za-z\-_]*)>/);
  const selfClose = xml.match(/^<([A-Za-z\-_]*)\/>/);

  if(open && open[1]) { return { tag: open[1], type: 'opening'}; }
  if(close && close[1]) { return { tag: close[1], type: 'closing'}; }
  if(selfClose && selfClose[1]) { return { tag: selfClose[1], type: 'self-closing'}; }
  return { tag: "", type: "" };
}

function parseNodes(
  xml: string,
  children: MyNode[]
): {xml: string, children: MyNode[]} {
  const {tag, type} = getNextTag(xml);
  switch(type) {
    case "opening":
      const result = parseNodes(xml.substring(tag.length + 2), []);
      return parseNodes(result.xml, children.concat(result.children));
      break;
    case "self-closing":
      children.push(new MyNode(tag, []));
      return parseNodes(xml.substring(tag.length+3), children);
    case "closing":
      return {
        xml: xml.substring(tag.length+3),
        children: [new MyNode(tag, children)]
      };
  };
  return { xml: xml, children: children };
}

describe("xml parser", () => {
  it("parses closing node", () => {
    expect(getNextTag("</tag>")).toEqual({tag: "tag", type: "closing"});
  });
  it("parses root node", () => {
    expect(parse("<xml></xml>")).toEqual("xml()");
  });
  it("parses nodes with special characters", () => {
    expect(parse("<xml_-></xml_->")).toEqual("xml_-()");
  });
  it("parses child node", () => {
    expect(parse("<xml><hi></hi></xml>")).toEqual("xml(hi())");
  });
  it("parses multiple child nodes", () => {
    expect(parse("<xml><hi></hi><there></there></xml>")).toEqual("xml(hi()there())");
  });
  it("parses multiple child nodes with nesting", () => {
    expect(parse("<xml><why><hi></hi></why><there></there></xml>")).toEqual("xml(why(hi())there())");
  });
  it("parses self closing nodes", () => {
    expect(parse("<xml/>")).toEqual("xml()");
  });
  it("parses self closing child nodes", () => {
    expect(parse("<xml><hi/></xml>")).toEqual("xml(hi())");
  });
  it("parses nesting self closing child nodes", () => {
    expect(parse("<xml><a><hi/></a></xml>")).toEqual("xml(a(hi()))");
  });
  it("parses multiple self closing child nodes", () => {
    expect(parse("<xml><hi/><there/></xml>")).toEqual("xml(hi()there())");
  });
  it("parses combinations of all nodes", () => {
    expect(parse("<xml><a><b/><c><d></d><e/></c><f><g/><h/></f></a></xml>")).toEqual("xml(a(b()c(d()e())f(g()h())))");
  });
});


