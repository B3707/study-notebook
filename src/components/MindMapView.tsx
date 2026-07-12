interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}

interface MindMapViewProps {
  data: MindMapNode;
}

export function MindMapView({ data }: MindMapViewProps) {
  return (
    <div className="w-full">
      {/* Root */}
      <div className="flex justify-center mb-2">
        <div className="bg-accent/10 text-accent text-xs font-medium font-serif px-3 py-1.5 rounded-full border border-accent/20">
          {data.title}
        </div>
      </div>

      {/* Level 1 children */}
      {data.children && data.children.length > 0 && (
        <div className="space-y-2">
          {/* Connecting line */}
          <div className="flex justify-center">
            <div className="w-px h-3 bg-accent/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.children.map((child, i) => (
              <MindMapCard key={i} node={child} level={1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MindMapCard({ node, level }: { node: MindMapNode; level: number }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="bg-secondary/40 rounded-lg p-3 border border-border/30">
      <p className="text-xs font-medium text-foreground mb-1">
        {node.title}
      </p>

      {hasChildren && (
        <div className="space-y-1 mt-1.5 pl-2 border-l-2 border-accent/20">
          {node.children!.map((child, i) => (
            <div key={i}>
              <p className="text-[11px] text-foreground/70 leading-relaxed">
                {child.title}
              </p>
              {child.children && child.children.length > 0 && (
                <div className="pl-3 mt-0.5 space-y-0.5">
                  {child.children.map((grandchild, j) => (
                    <p key={j} className="text-[10px] text-muted-foreground/60 leading-relaxed">
                      &bull; {grandchild.title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
