import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SimpleBookNavigation({ sections, currentSectionId, onNext, onPrevious, onSelectSection }) {
  const currentIndex = sections.findIndex(s => s.id === currentSectionId);

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onPrevious} disabled={currentIndex === 0}>
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Select value={currentSectionId} onValueChange={onSelectSection}>
        <SelectTrigger className="w-[150px] sm:w-[200px]">
          <SelectValue placeholder="Contents" />
        </SelectTrigger>
        <SelectContent>
          {sections.map(section => (
            <SelectItem key={section.id} value={section.id}>
              {section.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={onNext} disabled={currentIndex === sections.length - 1}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}