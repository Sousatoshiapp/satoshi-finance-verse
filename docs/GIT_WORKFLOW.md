# Git Workflow Guide for Satoshi Finance Verse

## 🚀 Quick Setup for Better Development

### 1. Essential Git Commands (Stop Using "Add files via upload")

```bash
# Basic workflow
git status                    # See what files changed
git add src/components/       # Add specific folders
git add src/pages/Settings.tsx  # Add specific files
git commit -m "Fix: User email validation in settings page"
git push origin main

# Never use:
git add .  # Too broad, adds everything
```

### 2. Commit Message Standards

**Bad Examples (from your history):**
- "Update Settings.tsx"
- "Add files via upload"

**Good Examples:**
```
Fix: User email validation in settings page
Feat: Add district selection to Satoshi City
Refactor: Consolidate logo imports in DistrictDetail
Style: Update XP logo positioning
Docs: Add API documentation for user endpoints
```

**Format:** `Type: Brief description of what changed`
- `Fix:` Bug fixes
- `Feat:` New features  
- `Refactor:` Code improvements
- `Style:` UI/CSS changes
- `Docs:` Documentation

### 3. File Organization Strategy

**Instead of this chaos:**
```
xp-logo.png → xp-logo2.png → xp-logo.png → xp-logoruin.png
```

**Do this:**
```
src/assets/logos/
  ├── companies/
  │   ├── xp-investments.png
  │   ├── anima-education.png
  │   └── banking-sector.png
  ├── districts/
  │   ├── xp-district-morning.jpg
  │   ├── xp-district-sunset.jpg
  │   └── xp-district-night.jpg
```

### 4. Fix Import Issues

**Your previous code (commit 309dfc5):**
```typescript
import xpDistrict3D from "@/assets/districts/xp-morning.jpg";
import xpDistrict3D from "@/assets/districts/xp-sunset.jpg";  // ❌ Duplicate!
import xpDistrict3D from "@/assets/districts/xp-night.jpg";   // ❌ Duplicate!
```

**Fixed version (already resolved):**
```typescript
import xpMorning from "@/assets/districts/xp-morning.jpg";
import xpSunset from "@/assets/districts/xp-sunset.jpg";
import xpNight from "@/assets/districts/xp-night.jpg";

// Use in component based on time/state
const getDistrictImage = (timeOfDay: string) => {
  switch(timeOfDay) {
    case 'morning': return xpMorning;
    case 'sunset': return xpSunset;
    case 'night': return xpNight;
    default: return xpMorning;
  }
};
```

### 5. Pre-commit Checklist

Before every commit:
- [ ] Test your changes locally
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Verify imports work correctly
- [ ] Write descriptive commit message

### 6. Branching Strategy

```bash
# Create feature branch
git checkout -b feature/user-profile-improvements
git checkout -b fix/district-logo-imports
git checkout -b refactor/settings-page-validation

# Work on your changes, then:
git add src/pages/Profile.tsx
git commit -m "Feat: Add avatar upload functionality to user profile"
git push origin feature/user-profile-improvements

# Create PR, get review, then merge
```

### 7. VS Code Setup

Install these extensions:
- GitLens (better git integration)
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Auto Rename Tag
- Prettier (code formatting)

### 8. Avoiding Reverts

**Before committing:**
1. Test in browser
2. Check console for errors
3. Verify all imports resolve
4. Run `npm run build` to catch build errors

**If you need to revert:**
```bash
git revert <commit-hash>  # Creates new commit that undoes changes
# Better than: git reset --hard (loses history)
```

## 🎯 Action Plan for Next Week

1. **Day 1-2:** Set up VS Code with recommended extensions
2. **Day 3:** Reorganize asset folder structure
3. **Day 4:** Fix duplicate imports in DistrictDetail.tsx
4. **Day 5:** Practice new commit message format
5. **Weekend:** Create feature branch for next major change

## 📊 Success Metrics

Track these improvements:
- Zero "Add files via upload" commits
- Descriptive commit messages (>5 words)
- No duplicate variable declarations
- Maximum 1 revert per month
- Organized file structure

---

*Remember: You built a successful fintech company - you can definitely master git! 🚀*
