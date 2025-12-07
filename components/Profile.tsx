import React from 'react';
import { UserProfile } from '../types';
import { Save } from 'lucide-react';
import { Button } from './ui/Button';

interface ProfileProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const handleChange = (field: keyof UserProfile, value: any) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'dietaryRestrictions' | 'allergies' | 'cuisinePreferences', value: string) => {
    const arr = value.split(',').map(s => s.trim());
    handleChange(field, arr);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="py-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Taste Profile</h2>
        <p className="text-slate-500">Customize how AI plans your meals.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input 
            type="text" 
            value={user.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Dietary Restrictions (comma separated)</label>
           <input 
             type="text" 
             defaultValue={user.dietaryRestrictions.join(', ')}
             onBlur={(e) => handleArrayChange('dietaryRestrictions', e.target.value)}
             className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
             placeholder="e.g. Vegetarian, Gluten-Free"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma separated)</label>
           <input 
             type="text" 
             defaultValue={user.allergies.join(', ')}
             onBlur={(e) => handleArrayChange('allergies', e.target.value)}
             className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
             placeholder="e.g. Peanuts, Shellfish"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Cuisines</label>
           <input 
             type="text" 
             defaultValue={user.cuisinePreferences ? user.cuisinePreferences.join(', ') : ''}
             onBlur={(e) => handleArrayChange('cuisinePreferences', e.target.value)}
             className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
             placeholder="e.g. Italian, Mexican, Indian"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Max Cooking Time (minutes)</label>
           <input 
             type="number" 
             value={user.maxCookingTime || 45}
             onChange={(e) => handleChange('maxCookingTime', parseInt(e.target.value))}
             className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
           />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Health Goal</label>
          <select 
            value={user.goals} 
            onChange={(e) => handleChange('goals', e.target.value)}
            className="w-full border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="maintenance">Maintenance (Balanced)</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="budget-friendly">Budget Friendly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cooking Skill</label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => handleChange('cookingSkill', level)}
                className={`py-2 text-sm rounded-lg border capitalize ${
                  user.cookingSkill === level 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        
        <div className="pt-4">
           <Button className="w-full" onClick={() => alert("Profile Saved!")}>
             <Save size={18} className="mr-2" />
             Save Changes
           </Button>
        </div>
      </div>
    </div>
  );
};