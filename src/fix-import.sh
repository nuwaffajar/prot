#!/bin/bash
# fix-imports.sh
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/@radix-ui\/react-[a-zA-Z-]*@[0-9.]*/@radix-ui\/&/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/lucide-react@[0-9.]*/lucide-react/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/cmdk@[0-9.]*/cmdk/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/vaul@[0-9.]*/vaul/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/input-otp@[0-9.]*/input-otp/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/react-hook-form@[0-9.]*/react-hook-form/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/next-themes@[0-9.]*/next-themes/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/sonner@[0-9.]*/sonner/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/react-resizable-panels@[0-9.]*/react-resizable-panels/g' {} \;
find ./src/components/ui -name "*.tsx" -type f -exec sed -i '' 's/class-variance-authority@[0-9.]*/class-variance-authority/g' {} \;