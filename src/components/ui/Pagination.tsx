import { Button } from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button 
        variant="secondary" 
        size="sm" 
        className="w-10 h-10 p-0 bg-[#1a1a1a] border-white/10 text-gray-400 disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lt;
      </Button>
      
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        // Simple pagination logic for demo: show first 3, current, and last
        if (
          page === 1 || 
          page === totalPages || 
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <Button 
              key={page}
              variant="secondary" 
              size="sm" 
              className={`w-10 h-10 p-0 ${
                currentPage === page 
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700' 
                  : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        }
        
        // Add ellipsis
        if (page === currentPage - 2 || page === currentPage + 2) {
          return <span key={page} className="text-gray-500 mx-1">...</span>
        }
        
        return null;
      })}

      <Button 
        variant="secondary" 
        size="sm" 
        className="w-10 h-10 p-0 bg-[#1a1a1a] border-white/10 text-gray-400 disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &gt;
      </Button>
    </div>
  )
}
