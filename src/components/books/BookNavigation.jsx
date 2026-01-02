import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Book, Volume2, Loader2, PauseCircle, ChevronRight, Lock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { sectionPages } from './InfinityContent';

const FREE_SECTIONS = ['introduction'];
const PARTIAL_FREE_SECTION = 'day1';
const FREE_PAGE_LIMIT_DAY1 = 4;

const NavItem = ({ id, title, isActive, isSubItem = false, onClick, onPlayAudio, audioState, currentPage, totalPages, isLocked, hasFullAccess }) => {
    const isThisAudioPlaying = audioState.isPlaying && audioState.sectionId === id;
    const isThisAudioLoading = audioState.isLoading && audioState.sectionId === id;

    const handlePlayClick = (e) => {
        e.stopPropagation();
        if (!isLocked) {
            onPlayAudio(id);
        }
    };
    
    return (
        <div
            className={cn(
                "w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between group",
                isLocked 
                    ? "text-gray-400 cursor-not-allowed bg-gray-50"
                    : isActive 
                        ? "bg-rose-100 text-rose-800 cursor-pointer" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer",
                isSubItem && "pl-8"
            )}
            onClick={() => !isLocked && onClick(id)}
        >
            <span className="flex-grow pr-2 truncate flex items-center gap-2">
              {isLocked && <Lock className="w-3 h-3 flex-shrink-0" />}
              {title}
            </span>
            {isActive && totalPages > 1 && !isLocked && (
                 <span className="text-xs text-rose-600/70 mr-2 flex-shrink-0">{` ${currentPage + 1}/${totalPages}`}</span>
            )}
            {!isLocked && (
              <motion.button
                  onClick={handlePlayClick}
                  className="p-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity text-rose-600 hover:bg-rose-200/50 flex-shrink-0"
                  whileTap={{ scale: 0.9 }}
                  title={`Play audio for ${title}`}
              >
                  {isThisAudioLoading && audioState.page === currentPage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isThisAudioPlaying && audioState.page === currentPage ? (
                      <PauseCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                      <Volume2 className="w-4 h-4" />
                  )}
              </motion.button>
            )}
        </div>
    );
};

const WeeklySection = ({ title, days, currentSection, currentPage, setSection, onPlayAudio, audioState, hasFullAccess }) => {
    const isWeekActive = days.some(day => day.id === currentSection);

    return (
        <Collapsible defaultOpen={isWeekActive}>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-left px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg group">
                {title}
                <ChevronRight className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-90 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1 space-y-1">
                 {days.map(day => {
                    const isActive = currentSection === day.id;
                    const totalPages = sectionPages[day.id]?.length || 1;
                    // Lock all sections except 'introduction' and first 4 pages of 'day1'
                    const isLocked = !hasFullAccess && (
                        (day.id !== PARTIAL_FREE_SECTION && !FREE_SECTIONS.includes(day.id))
                    );
                    return (
                        <NavItem
                            key={day.id}
                            id={day.id}
                            title={day.title}
                            isActive={isActive}
                            onClick={setSection}
                            onPlayAudio={onPlayAudio}
                            audioState={audioState}
                            currentPage={isActive ? currentPage : 0}
                            totalPages={totalPages}
                            isLocked={isLocked}
                            hasFullAccess={hasFullAccess}
                        />
                    );
                })}
            </CollapsibleContent>
        </Collapsible>
    );
};

export default function BookNavigation({ currentSection, currentPage, setSection, onPlayAudio, audioState, hasFullAccess }) {
  const sections = {
    introduction: { id: 'introduction', title: 'Introduction' },
    week1: Array.from({ length: 7 }, (_, i) => ({ id: `day${i + 1}`, title: `Day ${i + 1}` })),
    week2: Array.from({ length: 7 }, (_, i) => ({ id: `day${i + 8}`, title: `Day ${i + 8}` })),
    week3: Array.from({ length: 7 }, (_, i) => ({ id: `day${i + 15}`, title: `Day ${i + 15}` })),
    collections: [
        { id: 'reflections', title: 'All Reflections' },
        { id: 'affirmations', title: 'All Affirmations' },
    ]
  };

  return (
    <div className="h-full bg-stone-50/50 rounded-lg p-4 flex flex-col">
        <div className="p-4 mb-4 text-center">
            <Book className="w-8 h-8 mx-auto text-rose-400 mb-2" />
            <h2 className="font-bold text-gray-800">Book Contents</h2>
            <p className="text-xs text-gray-500">Navigate your journey</p>
            {!hasFullAccess && (
              <div className="mt-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                <p className="text-xs text-rose-700 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Preview Mode Active
                </p>
                <p className="text-[10px] text-rose-600 mt-1">
                  Free: Intro + Day 1 (pages 1-4)
                </p>
              </div>
            )}
        </div>
        <nav className="space-y-1 flex-grow overflow-y-auto pr-2 -mr-4">
            <NavItem 
                id="introduction" 
                title="Introduction" 
                isActive={currentSection === 'introduction'} 
                onClick={setSection} 
                onPlayAudio={onPlayAudio}
                audioState={audioState}
                currentPage={currentSection === 'introduction' ? currentPage : 0}
                totalPages={sectionPages.introduction.length}
                isLocked={false} // Introduction is always free
                hasFullAccess={hasFullAccess}
            />
            
            <div className="pt-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Readings</p>
                <WeeklySection 
                    title="Week 1"
                    days={sections.week1}
                    currentSection={currentSection}
                    currentPage={currentPage}
                    setSection={setSection}
                    onPlayAudio={onPlayAudio}
                    audioState={audioState}
                    hasFullAccess={hasFullAccess}
                />
                <WeeklySection 
                    title="Week 2"
                    days={sections.week2}
                    currentSection={currentSection}
                    currentPage={currentPage}
                    setSection={setSection}
                    onPlayAudio={onPlayAudio}
                    audioState={audioState}
                    hasFullAccess={hasFullAccess}
                />
                <WeeklySection 
                    title="Week 3"
                    days={sections.week3}
                    currentSection={currentSection}
                    currentPage={currentPage}
                    setSection={setSection}
                    onPlayAudio={onPlayAudio}
                    audioState={audioState}
                    hasFullAccess={hasFullAccess}
                />
            </div>

            <div className="pt-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Collections</p>
                {sections.collections.map(section => {
                     const isActive = currentSection === section.id;
                     const totalPages = sectionPages[section.id]?.length || 1;
                     const isLocked = !hasFullAccess; // Collections are locked without full access
                     return (
                        <NavItem 
                            key={section.id}
                            id={section.id} 
                            title={section.title} 
                            isActive={isActive} 
                            onClick={setSection}
                            onPlayAudio={onPlayAudio}
                            audioState={audioState}
                            currentPage={isActive ? currentPage : 0}
                            totalPages={totalPages}
                            isLocked={isLocked}
                            hasFullAccess={hasFullAccess}
                        />
                     );
                })}
            </div>
        </nav>
    </div>
  );
}