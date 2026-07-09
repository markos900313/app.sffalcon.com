interface PageSkeletonProps {
  showHeader?: boolean;
  rows?: number;
  showKPIs?: boolean;
}

export default function PageSkeleton(props: PageSkeletonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="w-10 h-10 border-2 border-[#1A2744] border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
