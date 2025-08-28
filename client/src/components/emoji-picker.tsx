import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Emoji keyword mapping for search functionality
const EMOJI_KEYWORDS: Record<string, string[]> = {
  "😀": ["happy", "smile", "grin", "joy", "cheerful"],
  "😃": ["happy", "smile", "grin", "joy", "excited"],
  "😄": ["happy", "smile", "laugh", "joy", "excited"],
  "😁": ["happy", "smile", "grin", "joy", "beam"],
  "😆": ["happy", "laugh", "smile", "joy", "giggle"],
  "😅": ["happy", "laugh", "smile", "sweat", "relief"],
  "😂": ["laugh", "joy", "tears", "funny", "hilarious"],
  "🤣": ["laugh", "rolling", "funny", "hilarious", "joy"],
  "😊": ["happy", "smile", "blush", "pleased", "content"],
  "😇": ["angel", "halo", "innocent", "good", "saint"],
  "🙂": ["smile", "happy", "slight", "content"],
  "🙃": ["upside", "down", "silly", "playful"],
  "😉": ["wink", "flirt", "playful", "cheeky"],
  "😌": ["relieved", "content", "peaceful", "calm"],
  "😍": ["love", "heart", "eyes", "adore", "crush"],
  "🥰": ["love", "hearts", "smiling", "adore", "affection"],
  "😘": ["kiss", "love", "heart", "blow"],
  "😗": ["kiss", "whistle", "lips"],
  "😙": ["kiss", "eyes", "closed"],
  "😚": ["kiss", "closed", "eyes"],
  "😋": ["yum", "delicious", "tongue", "taste", "savoring"],
  "😛": ["tongue", "playful", "cheeky", "silly"],
  "😝": ["tongue", "eyes", "closed", "playful"],
  "😜": ["tongue", "wink", "playful", "silly"],
  "🤪": ["crazy", "wild", "silly", "zany"],
  "🤨": ["suspicious", "skeptical", "raised", "eyebrow"],
  "😐": ["neutral", "expressionless", "meh"],
  "😑": ["expressionless", "blank", "meh"],
  "😶": ["no", "mouth", "quiet", "silent"],
  "😏": ["smirk", "sly", "knowing", "cheeky"],
  "😒": ["unamused", "annoyed", "meh", "unimpressed"],
  "🙄": ["eye", "roll", "annoyed", "whatever"],
  "😬": ["grimacing", "awkward", "eek"],
  "🤥": ["lying", "pinocchio", "nose"],
  "😔": ["sad", "pensive", "sorry", "thoughtful"],
  "😪": ["sleepy", "tired", "drowsy"],
  "🤤": ["drooling", "sleep", "desire"],
  "😴": ["sleeping", "sleep", "tired", "zzz"],
  "😷": ["mask", "sick", "medical", "doctor"],
  "🤒": ["sick", "thermometer", "fever", "ill"],
  "🤕": ["hurt", "bandage", "injured", "head"],
  "🤢": ["sick", "nauseous", "green", "ill"],
  "🤮": ["vomit", "sick", "throw", "up"],
  "🤧": ["sneeze", "sick", "tissue", "cold"],
  "🥵": ["hot", "sweating", "heat", "temperature"],
  "🥶": ["cold", "freezing", "blue", "temperature"],
  "🥴": ["drunk", "dizzy", "woozy", "tipsy"],
  "😵": ["dizzy", "confused", "knocked", "out"],
  "🤯": ["exploding", "head", "mind", "blown"],
  "🤠": ["cowboy", "hat", "western"],
  "🥳": ["party", "celebrate", "birthday", "hat"],
  "🥸": ["disguise", "glasses", "nose", "mustache"],
  "😎": ["cool", "sunglasses", "awesome", "smooth"],
  "🤓": ["nerd", "glasses", "smart", "geek"],
  "🧐": ["thinking", "monocle", "curious", "examining"],
  "😕": ["confused", "slightly", "sad"],
  "😟": ["worried", "concerned", "anxious"],
  "🙁": ["sad", "frown", "disappointed"],
  "☹️": ["sad", "frown", "upset"],
  "😮": ["open", "mouth", "surprised", "wow"],
  "😯": ["hushed", "surprised", "amazed"],
  "😲": ["astonished", "shocked", "amazed"],
  "😳": ["flushed", "embarrassed", "surprised"],
  "🥺": ["pleading", "puppy", "eyes", "cute"],
  "😦": ["frowning", "open", "mouth"],
  "😧": ["anguished", "shocked", "surprised"],
  "😨": ["fearful", "scared", "frightened"],
  "😰": ["anxious", "blue", "sweat", "nervous"],
  "😥": ["sad", "sweat", "disappointed"],
  "😢": ["cry", "tear", "sad", "upset"],
  "😭": ["cry", "sobbing", "tears", "bawling"],
  "😱": ["screaming", "fear", "shocked", "scared"],
  "😖": ["confounded", "frustrated", "annoyed"],
  "😣": ["persevering", "struggling", "effort"],
  "😞": ["sad", "disappointed", "dejected"],
  "😓": ["downcast", "sweat", "hard", "work"],
  "😩": ["weary", "tired", "frustrated"],
  "😫": ["tired", "exhausted", "fed", "up"],
  "🥱": ["yawning", "tired", "sleepy", "bored"],
  "😤": ["huffing", "proud", "triumph", "snorting"],
  "😡": ["angry", "rage", "furious", "mad"],
  "😠": ["angry", "mad", "annoyed", "grumpy"],
  "🤬": ["swearing", "cursing", "angry", "symbols"],
  "😈": ["devil", "evil", "mischievous", "horns"],
  "👿": ["angry", "devil", "evil", "imp"],
  "💀": ["skull", "death", "dead", "skeleton"],
  "☠️": ["skull", "bones", "poison", "danger"],
  "💩": ["poop", "poo", "shit", "crap"],
  // Nature
  "🐶": ["dog", "puppy", "pet", "animal"],
  "🐱": ["cat", "kitten", "pet", "animal"],
  "🐭": ["mouse", "animal", "rodent"],
  "🐹": ["hamster", "pet", "animal", "rodent"],
  "🐰": ["rabbit", "bunny", "animal", "pet"],
  "🦊": ["fox", "animal", "cunning"],
  "🐻": ["bear", "animal", "teddy"],
  "🐼": ["panda", "bear", "animal", "bamboo"],
  "🐨": ["koala", "animal", "australia"],
  "🐯": ["tiger", "animal", "stripes"],
  "🦁": ["lion", "animal", "king", "mane"],
  "🐮": ["cow", "animal", "farm", "milk"],
  "🐷": ["pig", "animal", "farm", "oink"],
  "🐽": ["pig", "nose", "snout"],
  "🐸": ["frog", "animal", "green", "pond"],
  "🐵": ["monkey", "animal", "banana"],
  // Food
  "🍇": ["grapes", "fruit", "purple", "wine"],
  "🍎": ["apple", "fruit", "red", "healthy"],
  "🍌": ["banana", "fruit", "yellow", "monkey"],
  "🍊": ["orange", "fruit", "citrus", "vitamin"],
  "🍋": ["lemon", "fruit", "sour", "yellow"],
  "🍕": ["pizza", "food", "italian", "cheese"],
  "🍔": ["burger", "hamburger", "food", "fast"],
  "🍟": ["fries", "french", "potato", "food"],
  "🌭": ["hot", "dog", "sausage", "food"],
  "🥪": ["sandwich", "food", "lunch"],
  "🌮": ["taco", "mexican", "food"],
  "🌯": ["burrito", "wrap", "mexican", "food"],
  "🍝": ["pasta", "spaghetti", "italian", "noodles"],
  "🍜": ["ramen", "noodles", "steaming", "bowl"],
  // Activities
  "⚽": ["soccer", "football", "ball", "sport"],
  "🏀": ["basketball", "ball", "sport"],
  "🏈": ["american", "football", "ball", "sport"],
  "⚾": ["baseball", "ball", "sport"],
  "🎾": ["tennis", "ball", "sport"],
  "🎵": ["music", "note", "song", "melody"],
  "🎶": ["musical", "notes", "song", "melody"],
  "🎤": ["microphone", "singing", "karaoke"],
  "🎧": ["headphones", "music", "listening"],
  "🎨": ["art", "palette", "painting", "creative"],
  // Travel
  "✈️": ["airplane", "plane", "flight", "travel"],
  "🚗": ["car", "automobile", "vehicle", "red"],
  "🚕": ["taxi", "cab", "yellow", "car"],
  "🚙": ["suv", "car", "blue", "vehicle"],
  "🚌": ["bus", "public", "transport"],
  "🏠": ["house", "home", "building"],
  "🏡": ["house", "garden", "home", "building"],
  // Objects
  "📱": ["phone", "mobile", "cell", "smartphone"],
  "💻": ["laptop", "computer", "macbook", "pc"],
  "⌨️": ["keyboard", "typing", "computer"],
  "🖱️": ["mouse", "computer", "click"],
  "🖥️": ["desktop", "computer", "monitor"],
  "📺": ["tv", "television", "screen"],
  "📷": ["camera", "photo", "picture"],
  "📸": ["camera", "flash", "photo", "picture"],
  // Symbols
  "❤️": ["heart", "love", "red", "romance"],
  "🧡": ["orange", "heart", "love"],
  "💛": ["yellow", "heart", "love", "gold"],
  "💚": ["green", "heart", "love", "nature"],
  "💙": ["blue", "heart", "love"],
  "💜": ["purple", "heart", "love"],
  "🖤": ["black", "heart", "love", "dark"],
  "🤍": ["white", "heart", "love", "pure"],
  "🤎": ["brown", "heart", "love"],
  "💕": ["two", "hearts", "love", "pink"],
  "💞": ["revolving", "hearts", "love"],
  "💓": ["beating", "heart", "love", "pulse"],
  "💗": ["growing", "heart", "love"],
  "💖": ["sparkling", "heart", "love", "glitter"],
  "💘": ["heart", "arrow", "cupid", "love"],
  "💝": ["heart", "ribbon", "gift", "love"]
};

// Comprehensive emoji data organized by categories
const EMOJI_CATEGORIES = {
  "Smileys & People": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
    "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒",
    "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕",
    "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱",
    "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩"
  ],
  "Nature": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵",
    "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
    "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🪲", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎",
    "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅",
    "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖"
  ],
  "Food & Drink": [
    "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝",
    "🍅", "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄",
    "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔",
    "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗",
    "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥"
  ],
  "Activities": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍",
    "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿",
    "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️", "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣",
    "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹", "🎭",
    "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🥁", "🪘", "🎹", "🎷", "🎺", "🪗", "🎸", "🪕"
  ],
  "Travel & Places": [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵",
    "🚲", "🛴", "🛹", "🛼", "🚁", "🛸", "✈️", "🛩️", "🪂", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓",
    "⛽", "🚧", "🚨", "🚥", "🚦", "🛑", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢",
    "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🛖", "🏠", "🏡", "🏘️",
    "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛️", "⛪"
  ],
  "Objects": [
    "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼",
    "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭",
    "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸",
    "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️",
    "🔩", "⚙️", "🪚", "🔫", "🧲", "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "🪦", "⚱️"
  ],
  "Symbols": [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈",
    "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳",
    "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️",
    "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️", "🚷", "🚯"
  ]
};

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

export function EmojiPicker({ isOpen, onClose, onEmojiSelect, selectedEmoji }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Smileys & People");

  const filteredEmojis = useMemo(() => {
    if (!searchTerm) {
      return EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || [];
    }

    // Search across all categories using keywords
    const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
    const searchTermLower = searchTerm.toLowerCase();
    
    return allEmojis.filter(emoji => {
      // Check if emoji has keywords and if any keyword matches the search term
      const keywords = EMOJI_KEYWORDS[emoji];
      if (keywords) {
        return keywords.some(keyword => keyword.includes(searchTermLower));
      }
      // Fallback to direct emoji character search for emojis without keywords
      return emoji.includes(searchTerm);
    });
  }, [searchTerm, selectedCategory]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] bg-dark-surface border-dark-elevated">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-text-primary">
            Choose an emoji
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search emojis..."
            className="pl-10 bg-dark-elevated border-text-secondary/20 !text-white placeholder:!text-gray-400"
            style={{ color: 'white' }}
            data-testid="input-emoji-search"
          />
        </div>

        {/* Category Tabs */}
        {!searchTerm && (
          <div className="flex flex-wrap gap-1 mb-4">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full transition-colors",
                  selectedCategory === category
                    ? "bg-spotify text-dark-bg font-medium"
                    : "bg-dark-elevated text-text-secondary hover:bg-dark-elevated/80"
                )}
                data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div className="overflow-y-auto max-h-80">
          {searchTerm && (
            <p className="text-sm text-text-secondary mb-3">
              Search results for "{searchTerm}"
            </p>
          )}
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className={cn(
                  "p-2 text-xl hover:bg-dark-elevated rounded-lg transition-colors border-2 border-transparent",
                  selectedEmoji === emoji && "border-vibe-orange bg-dark-elevated"
                )}
                data-testid={`button-emoji-option-${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          {filteredEmojis.length === 0 && searchTerm && (
            <div className="text-center py-8 text-text-secondary">
              <p>No emojis found for "{searchTerm}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}