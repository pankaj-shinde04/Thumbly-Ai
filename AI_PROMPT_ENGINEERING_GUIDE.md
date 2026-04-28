# AI Prompt Engineering Guide for Google Vertex AI Imagen

## Overview
This guide provides best practices for writing effective prompts for Google Vertex AI Imagen to generate high-quality, predictable images for your AI design tool.

## Platform-Specific Templates

### YouTube Thumbnails (16:9)
**Characteristics:**
- Wide horizontal layout
- Subject positioned on left or right third (rule of thirds)
- Bold text overlay space on opposite side
- High contrast for thumbnail visibility
- Dramatic lighting, rim lighting, neon accents
- Vibrant colors that pop on dark backgrounds

**Example Prompt:**
```
A shocked man pointing at a laptop, dark background, neon lighting, bold text 'SECRET TRICK', wide horizontal layout, subject positioned on left third, bold text overlay space on right side, high contrast for thumbnail visibility, dramatic lighting, rim lighting, neon accents, vibrant colors that pop on dark backgrounds, photorealistic, hyperrealistic, ultra realistic, professional photography, DSLR quality, studio lighting, detailed texture, natural skin tones, accurate colors, ultra high definition, 8K, professional photography quality, sharp focus, high saturation, sharp focus, high detail, professional quality, avoid: no blur, no distortion, no watermark, no text artifacts, no misspelled words, no low resolution, no pixelation, no bad anatomy, no out of focus, no poor quality, no grain, no noise, no chromatic aberration, no motion blur, no camera shake, no overexposure, no underexposure, no washed out colors, no muted colors, no desaturated, no black and white unless specified
```

### Instagram Posts (1:1)
**Characteristics:**
- Centered subject
- Balanced framing
- Symmetrical or rule-of-thirds
- Clean negative space
- Minimal distractions
- Soft natural lighting
- Golden hour tones
- Bright and airy
- Consistent color palette

**Example Prompt:**
```
A professional portrait of a woman in modern office, centered subject, balanced framing, symmetrical composition, clean negative space, minimal distractions, soft natural lighting, golden hour tones, bright and airy, consistent color palette, professional studio lighting, photorealistic, hyperrealistic, ultra realistic, professional photography, DSLR quality, studio lighting, detailed texture, natural skin tones, accurate colors, high definition, sharp details, clean edges, professional photography, Instagram-optimized colors, sharp focus, high detail, professional quality, avoid: no blur, no distortion, no watermark, no text artifacts, no misspelled words, no low resolution, no pixelation, no bad anatomy, no out of focus, no poor quality, no grain, no noise, no chromatic aberration, no motion blur, no camera shake, no overexposure, no underexposure, no washed out colors, no muted colors, no desaturated, no black and white unless specified
```

### Instagram Reel Covers (9:16)
**Characteristics:**
- Vertical portrait layout
- Subject centered or slightly above center
- Top space for text overlay
- Bottom space for captions
- Dynamic angles
- Dramatic vertical lighting
- Gradient backgrounds
- Neon effects
- High contrast for mobile viewing
- Vibrant colors

**Example Prompt:**
```
A fitness model in dynamic pose, vertical portrait layout, subject centered slightly above center, top space for text overlay, bottom space for captions, dynamic angles, dramatic vertical lighting, gradient backgrounds, neon effects, high contrast for mobile viewing, vibrant colors, photorealistic, hyperrealistic, ultra realistic, professional photography, DSLR quality, studio lighting, detailed texture, natural skin tones, accurate colors, high definition, sharp focus, optimized for mobile display, professional quality, vivid colors, sharp focus, high detail, professional quality, avoid: no blur, no distortion, no watermark, no text artifacts, no misspelled words, no low resolution, no pixelation, no bad anatomy, no out of focus, no poor quality, no grain, no noise, no chromatic aberration, no motion blur, no camera shake, no overexposure, no underexposure, no washed out colors, no muted colors, no desaturated, no black and white unless specified
```

## Prompt Structure

### Best Practice Structure
1. **Subject/Action** - What you want to see (primary)
2. **Platform Composition** - Layout specific to platform
3. **Lighting/Atmosphere** - Mood and lighting style
4. **Style/Quality** - Artistic style and technical quality
5. **Negative Constraints** - What to avoid

### Example Structure
```
[Subject + Action], [Platform Composition], [Lighting/Atmosphere], [Style/Quality], [Technical Specs], avoid: [Negative Constraints]
```

## Style Options

### Available Styles
- **realistic** - Photorealistic, professional photography
- **artistic** - Digital art, creative interpretation
- **cartoon** - Cartoon style, animated, illustration
- **minimalist** - Clean, simple, modern aesthetic
- **cinematic** - Movie poster style, dramatic lighting
- **neon** - Cyberpunk style, glowing effects
- **corporate** - Professional, trustworthy, polished
- **gaming** - Vibrant colors, dynamic action, esports quality

### Style-Specific Enhancements

**Realistic:**
```
photorealistic, hyperrealistic, ultra realistic, professional photography, DSLR quality, studio lighting, detailed texture, natural skin tones, accurate colors
```

**Cinematic:**
```
cinematic quality, movie poster style, dramatic lighting, film grain, professional cinematography, color graded, atmospheric, epic composition
```

**Neon:**
```
neon aesthetics, cyberpunk style, glowing effects, vibrant neon colors, futuristic, dark background with bright accents, high contrast, LED lighting
```

## Negative Constraints

### Always Include These
- `no blur` - Prevents blurry images
- `no distortion` - Prevents warped/distorted images
- `no watermark` - Prevents watermarks
- `no text artifacts` - Prevents garbled text
- `no misspelled words` - Ensures text is correct
- `no low resolution` - Ensures high quality
- `no pixelation` - Prevents pixelated images
- `no bad anatomy` - Prevents anatomical errors
- `no out of focus` - Ensures sharp focus
- `no poor quality` - Ensures high quality
- `no grain` - Prevents film grain
- `no noise` - Prevents digital noise
- `no chromatic aberration` - Prevents color fringing
- `no motion blur` - Prevents motion artifacts
- `no camera shake` - Prevents shaky images
- `no overexposure` - Prevents blown-out highlights
- `no underexposure` - Prevents dark images
- `no washed out colors` - Ensures vibrant colors
- `no muted colors` - Ensures vivid colors
- `no desaturated` - Ensures color saturation
- `no black and white unless specified` - Ensures color unless requested

## Best Practices for Imagen

### 1. Be Specific and Detailed
**Bad:** "A man with a laptop"
**Good:** "A professional man in his 30s with short brown hair, wearing a blue button-down shirt, sitting at a modern desk with a silver laptop, focused expression, office environment with blurred background"

### 2. Specify Composition
**Bad:** "A product shot"
**Good:** "Product shot with subject centered, clean white background, soft studio lighting, top-down angle, plenty of negative space, minimalist composition"

### 3. Describe Lighting
**Bad:** "Good lighting"
**Good:** "Soft natural lighting from left side, golden hour tones, subtle rim lighting, warm color temperature, soft shadows"

### 4. Include Style References
**Bad:** "Cool style"
**Good:** "Cyberpunk aesthetic, neon glow, futuristic cityscape, synthwave colors, 1980s retro-futurism"

### 5. Specify Technical Quality
**Bad:** "High quality"
**Good:** "8K resolution, ultra high definition, sharp focus, professional photography quality, DSLR quality, studio lighting"

### 6. Use Platform-Specific Guidelines
- Always match aspect ratio to platform
- Use platform-specific composition rules
- Consider mobile vs desktop viewing
- Account for text overlay space

## Improving Consistency

### 1. Use Similar Prompts
Keep prompt structure consistent across generations:
```
[Subject], [Platform Composition], [Lighting], [Style], [Quality], avoid: [Constraints]
```

### 2. Fix Style and Platform
Always use the same style and platform for consistent results:
- Style: `realistic` or `cinematic` for consistent look
- Platform: Match to intended output format

### 3. Be Specific About Details
- Age, gender, appearance
- Clothing, colors, materials
- Environment, background
- Lighting direction and quality
- Camera angle and distance

### 4. Avoid Ambiguity
- Instead of "some people" use "two men in their 20s"
- Instead of "bright colors" use "vibrant blue and orange"
- Instead of "modern" use "contemporary minimalist design"

## Common Issues and Solutions

### Issue: Text is missing or incorrect
**Solution:** 
- Be explicit about text content: "bold text 'SECRET TRICK' in sans-serif font, white color with black outline"
- Specify text placement: "text overlay on right side"
- Include negative constraints: "no text artifacts, no misspelled words"

### Issue: Subject not matching description
**Solution:**
- Be more specific about appearance: "man with short brown hair, blue eyes, wearing glasses"
- Include age and style: "professional man in his 30s, business casual attire"
- Specify pose and expression: "looking directly at camera with surprised expression"

### Issue: Layout not as expected
**Solution:**
- Specify composition: "subject positioned on left third"
- Include negative space: "plenty of negative space on right for text"
- Specify camera angle: "slightly low angle looking up at subject"

### Issue: Colors are washed out
**Solution:**
- Specify color palette: "vibrant blue and orange color scheme"
- Include saturation: "high saturation, vivid colors"
- Add contrast: "high contrast, bold colors"
- Include negative constraints: "no washed out colors, no muted colors"

### Issue: Image is blurry
**Solution:**
- Specify focus: "sharp focus, clear details"
- Include quality specs: "8K resolution, ultra high definition"
- Add negative constraints: "no blur, no out of focus, no motion blur"

## Advanced Techniques

### 1. Layered Prompts
Build complexity gradually:
```
Layer 1: Base subject and action
Layer 2: Environment and context
Layer 3: Lighting and atmosphere
Layer 4: Style and quality
Layer 5: Technical specifications
```

### 2. Reference Specific Styles
Use style references for consistent looks:
```
in the style of National Geographic photography
in the style of Apple product photography
in the style of Wes Anderson films
```

### 3. Specify Color Palettes
Be explicit about colors:
```
color palette: deep navy blue, bright cyan, white, with orange accents
monochromatic blue color scheme
warm golden hour color palette
```

### 4. Camera and Lens Specs
Add technical photography details:
```
shot with 85mm lens at f/2.8
wide angle shot with 24mm lens
macro photography style
```

### 5. Post-Processing Effects
Specify editing style:
```
color graded, cinematic color correction
high contrast, dramatic shadows
soft focus, dreamlike atmosphere
```

## Testing and Iteration

### 1. A/B Testing
Test different prompt variations:
- Variation A: Detailed description
- Variation B: Minimal description
- Compare results and iterate

### 2. Incremental Changes
Change one element at a time:
- Keep base prompt constant
- Change only lighting
- Compare results
- Change only composition
- Compare results

### 3. Document Successful Prompts
Save prompts that work well:
- Note the platform
- Note the style
- Note the subject
- Use as templates for similar requests

## Summary Checklist

Before generating an image, ensure your prompt includes:

- [ ] Specific subject description
- [ ] Platform-specific composition
- [ ] Lighting and atmosphere
- [ ] Style and quality specifications
- [ ] Negative constraints
- [ ] Technical quality specs
- [ ] Color palette (if important)
- [ ] Text specifications (if needed)
- [ ] Camera angle and distance

## Quick Reference

### YouTube Thumbnail Template
```
[Subject], wide horizontal layout, subject positioned on left third, bold text overlay space on right side, high contrast for thumbnail visibility, dramatic lighting, rim lighting, neon accents, vibrant colors that pop on dark backgrounds, [Style], ultra high definition, 8K, professional photography quality, sharp focus, high saturation, sharp focus, high detail, professional quality, avoid: [Negative Constraints]
```

### Instagram Post Template
```
[Subject], centered subject, balanced framing, symmetrical composition, clean negative space, minimal distractions, soft natural lighting, golden hour tones, bright and airy, consistent color palette, professional studio lighting, [Style], high definition, sharp details, clean edges, professional photography, Instagram-optimized colors, sharp focus, high detail, professional quality, avoid: [Negative Constraints]
```

### Instagram Reel Cover Template
```
[Subject], vertical portrait layout, subject centered slightly above center, top space for text overlay, bottom space for captions, dynamic angles, dramatic vertical lighting, gradient backgrounds, neon effects, high contrast for mobile viewing, vibrant colors, [Style], high definition, sharp focus, optimized for mobile display, professional quality, vivid colors, sharp focus, high detail, professional quality, avoid: [Negative Constraints]
```
