import HeroSection from '@/components/home/HeroSection';
import HomeSearch from '@/components/home/HomeSearch';
import ActionGrid from '@/components/home/QuickAccess/ActionGrid';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Remove container padding for banner */}
      <div className="-mx-4">
        <HeroSection>
          <HomeSearch className="w-full px-4" />
        </HeroSection>
      </div>
      
      <ActionGrid />
    </div>
  );
}
