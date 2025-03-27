import { colorProfiles, ColorType } from "@/lib/colorProfiles";
import { Card, CardContent } from "@/components/ui/card";

interface ColorProfileProps {
  color: ColorType;
}

export function ColorProfile({ color }: ColorProfileProps) {
  const profile = colorProfiles[color];
  
  return (
    <div 
      className="bg-gray-50 rounded-lg p-4 text-center" 
      style={{ borderLeft: `4px solid ${profile.bgColor}` }}
    >
      <div className="flex flex-col items-center mb-3">
        <div 
          className="w-16 h-8 mb-2 rounded" 
          style={{ backgroundColor: profile.bgColor }}
        ></div>
        <h3 className="text-lg font-semibold">{profile.name}</h3>
      </div>
      <p className="text-sm line-clamp-3">{profile.description}</p>
    </div>
  );
}

interface ColorProfileDetailProps {
  color: ColorType;
}

export function ColorProfileDetail({ color }: ColorProfileDetailProps) {
  const profile = colorProfiles[color];
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-6">
          <div 
            className="w-16 h-8 sm:w-12 sm:h-12 rounded sm:rounded-full mb-2 sm:mb-0 sm:mr-4" 
            style={{ backgroundColor: profile.bgColor }}
          ></div>
          <h3 className="text-lg sm:text-xl font-semibold text-center sm:text-left">{profile.name}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Appears:</p>
              <p className="text-xs sm:text-sm">{profile.appears}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Wants to be:</p>
              <p className="text-xs sm:text-sm">{profile.wantsToBe}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Primary focus:</p>
              <p className="text-xs sm:text-sm">{profile.primaryFocus}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Likes YOU to be:</p>
              <p className="text-xs sm:text-sm">{profile.likesYouToBe}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Fears:</p>
              <p className="text-xs sm:text-sm">{profile.fears}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Can be irritated by:</p>
              <p className="text-xs sm:text-sm">{profile.canBeIrritatedBy}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Under pressure may:</p>
              <p className="text-xs sm:text-sm">{profile.underPressureMay}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs sm:text-sm font-semibold">Decisions are:</p>
              <p className="text-xs sm:text-sm">{profile.decisionsAre}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
