// @ts-nocheck
/* eslint-disable */
// extracted from twocans
const UCP = (() => {
        let PST = (() => {
    const [PASTEL_regCallback, addFormattedTextToTokens, addLiteralTextToTokenStream, cleanLineSplit, codeblockContentToHtml, convertTextToCellAlignment, countPrefixSize, CS_hasMore, CS_isNext, CS_peek, CS_peekType, CS_pop, Ctx_newColorSet, escapeHtml, fail, finickyColumnSplit, Fmt_consolidatePlainTokens, Fmt_convertStringToTagType, Fmt_getHttpUrlLength, Fmt_invalidateToken, Fmt_isStringNextInCharList, Fmt_parse, Fmt_parseSiblings, Fmt_parseTag, Fmt_removeRedundantTags, Fmt_splitToChunks, Fmt_tokenize, Fmt_tokenPeekType, Fmt_tokenPop, fmtNodeTypeToTokenId, htmlEscape, isAlphaNumsOnly, maybeColumnSmartSplit, newChatContext, newFailedMarkupToText, newFmtNodeJoiner, newFmtNodeText, newFmtNodeUrl, newFmtTokenStream, newForumContext, newNodeWithChildren, newNodeWithContent, newNodeWithFormattedContent, newPollOptionContext, newProfileBioContext, newQaAnswerContext, newQaQuestionContext, newUcpContextDefault, newUcpContextFormalBlock, newUcpContextInformalBlock, newUcpContextOneLineSnippet, newVChunk, newVChunkIntArg, newVChunkStrArg, newVStack, normalizeSpoilerTags, objArr1, parseImage, parseList, parseNextChunk, parseNode, parseTable, parseTextChunk, parseTillCloseTag, parseToChunks, parseToHtml, parseToPreview, parseToTokens, parseToTree, performSizeLimitTrimming, popAndAddChunkToOutput, removeSecondItem, serializationRequiresLineBreak, serializeCodeBlockToTokens, serializeImageToTokens, serializeListToTokens, serializeMLineSpoilerToTokens, serializeNodeSequenceToTokens, serializeNodeToTokens, serializeQuoteToTokens, serializeTableToTokens, serializeTextToTokens, serializeVStackToTokens, splitSpoilerContainingTextToSubTokens, string_unicodeSplit, strToSet, toAlphaNumsOnly, tokensToHtml, tokensToPreview, tokenToHtmlTag, tokenToHtmlTagClose, treeToTokens, ucpValidate] = (() => {
    let PST$checksubstring = (s, index, lookfor) => s.substring(index, index + lookfor.length) === lookfor;

    let PST$clearList = a => {
    	while (a.length) a.pop();
    };

    let PST$createNewArray = (s, val) => {
    	let o = [];
    	while (s --> 0) o.push(val);
    	return o;
    };

    let PST$b64Alpha = (() => {
        let letters = 'abcdefghijklmnopqrstuvwxyz';
        let alpha = letters.toUpperCase() + letters + '0123456789+/';
        let inv = {};
        for (let i = 0; i < 64; i++) inv[alpha[i]] = i;
        return { alpha, inv };
    })();

    let PST$bytesToB64 = arr => {
      let sz = arr.length;
      let pairs = [];
      let { alpha } = PST$b64Alpha;
      let b;
      for (let i = 0; i < sz; i++){
        b = arr[i];
        pairs.push((b >> 6) & 3, (b >> 4) & 3, (b >> 2) & 3, b & 3);
      }
      while (pairs.length % 3) pairs.push(0);
      let output = '';
      for (let i = 0; i < pairs.length; i += 3) {
        output += alpha[(pairs[i] << 4) | (pairs[i + 1] << 2) | pairs[i + 2]];
      }
      while (output.length % 4) output += '=';
      return output;
    };

    let PST$stringToUtf8Bytes = s => Array.from(new TextEncoder().encode(s));

    let PST$b64ToBytes = s => {
        let len = s.length;
        while (len && s[len - 1] === '=') len--;
        let pairs = [];
        let c;
        let lookup = PST$b64Alpha.inv;
        for (let i = 0; i < len; i++) {
            c = lookup[s[i]];
            pairs.push((c >> 4) & 3, (c >> 2) & 3, c & 3);
        }
        while (pairs.length % 4) pairs.pop();
        let buf = [];
        len = pairs.length;
        for (let i = 0; i < len; i += 4) {
            buf.push((pairs[i] << 6) | (pairs[i + 1] << 4) | (pairs[i + 2] << 2) | (pairs[i + 3]));
        }
        return buf;
    };

    let PST$extCallbacks = {};

    let PST$registerExtensibleCallback = (name, fn) => { PST$extCallbacks[name] = fn; };

    let $addFormattedTextToTokens = function($node, $buffer) {
    	let $tag = $fmtNodeTypeToTokenId($node[0], $node[3]);
    	let $closeTag = $tag;
    	if ($tag != null) {
    		$buffer.push(["<", $tag, ">"].join(''));
    		let $hyphen = $tag.indexOf("-");
    		if ($hyphen != -1) {
    			$closeTag = $tag.substring(0, 0 + $hyphen);
    		}
    	}
    	if ($node[1] != null) {
    		$addLiteralTextToTokenStream($node[1], $buffer);
    	} else {
    		let $i = 0;
    		while ($i < $node[2].length) {
    			$addFormattedTextToTokens($node[2][$i], $buffer);
    			$i += 1;
    		}
    	}
    	if ($closeTag != null) {
    		$buffer.push(["</", $closeTag, ">"].join(''));
    	}
    };

    let $addLiteralTextToTokenStream = function($val, $buffer) {
    	if ($val.startsWith("<")) {
    		$buffer.push("<lt-esc>");
    	}
    	if ($val != "") {
    		$buffer.push($val);
    	}
    };

    let $cleanLineSplit = function($originalText) {
    	let $lines = $originalText.trim().split("\n");
    	let $i = 0;
    	while ($i < $lines.length) {
    		let $line = $lines[$i].trimEnd();
    		$lines[$i] = $line;
    		$i += 1;
    	}
    	return $lines;
    };

    let $codeblockContentToHtml = function($val) {
    	let $sb = [];
    	$htmlEscape($val, $sb);
    	let $c = "";
    	let $len = $sb.length;
    	let $i = 0;
    	while ($i < $len) {
    		$c = $sb[$i];
    		if ($c == " ") {
    			$sb[$i] = "&nbsp;";
    		} else if ($c == "\n") {
    			$sb[$i] = "<br>";
    		}
    		$i += 1;
    	}
    	return $sb.join("");
    };

    let $convertTextToCellAlignment = function($val) {
    	if ($val.length < 3) {
    		return 0;
    	}
    	let $colonPre = $val.startsWith(":");
    	let $colonPost = $val.endsWith(":");
    	let $startIndex = 0;
    	let $endIndex = $val.length;
    	if ($colonPre) {
    		$startIndex = 1;
    	}
    	if ($colonPost) {
    		$endIndex -= 1;
    	}
    	let $i = $startIndex;
    	while ($i < $endIndex) {
    		if ($val.charAt($i) != "-") {
    			return 0;
    		}
    		$i += 1;
    	}
    	if ($colonPre && $colonPost) {
    		return 3;
    	}
    	if ($colonPost) {
    		return 2;
    	}
    	return 1;
    };

    let $countPrefixSize = function($str, $token) {
    	if (!$str.startsWith($token)) {
    		return 0;
    	}
    	let $tokSize = $token.length;
    	let $count = 0;
    	let $i = 0;
    	while ($i + $tokSize <= $str.length) {
    		if (!PST$checksubstring($str, $i, $token)) {
    			return $count;
    		}
    		$count += 1;
    		$i += $tokSize;
    	}
    	return $count;
    };

    let $CS_hasMore = function($cs) {
    	return $cs[2] < $cs[3];
    };

    let $CS_isNext = function($cs, $type) {
    	return $cs[2] < $cs[3] && $cs[1][$cs[2]][0] == $type;
    };

    let $CS_peek = function($cs) {
    	if ($cs[2] >= $cs[3]) {
    		return null;
    	}
    	return $cs[1][$cs[2]];
    };

    let $CS_peekType = function($cs) {
    	let $c = $CS_peek($cs);
    	if ($c == null) {
    		return 0;
    	}
    	return $c[0];
    };

    let $CS_pop = function($cs) {
    	if ($cs[2] >= $cs[3]) {
    		$fail("EOS");
    	}
    	$cs[2] = $cs[2] + 1;
    	return $cs[1][$cs[2] - 1];
    };

    let $Ctx_newColorSet = function() {
    	let $o = {};
    	$o["red"] = 7;
    	$o["orange"] = 8;
    	$o["yellow"] = 9;
    	$o["green"] = 10;
    	$o["blue"] = 11;
    	$o["purple"] = 12;
    	$o["pink"] = 14;
    	$o["brown"] = 13;
    	$o["gray"] = 15;
    	$o["mauve"] = 16;
    	$o["aqua"] = 17;
    	$o["maroon"] = 18;
    	$o["cyan"] = 19;
    	$o["lime"] = 20;
    	return $o;
    };

    let $escapeHtml = function($val) {
    	return $val.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split("\"").join("&quot;");
    };

    let $fail = function($msg) {
    	PST$extCallbacks["fail"]($objArr1($msg));
    };

    let $finickyColumnSplit = function($value) {
    	return null;
    };

    let $Fmt_consolidatePlainTokens = function($tokens) {
    	let $output = [];
    	let $sb = [];
    	let $length = $tokens.length;
    	let $i = 0;
    	while ($i < $length) {
    		let $tok = $tokens[$i];
    		if ($tok[1] == 0 && ($i + 1 < $length && $tokens[$i + 1][1] == 0)) {
    			while ($i < $length && $tokens[$i][1] == 0) {
    				$sb.push($tokens[$i][0]);
    				$i += 1;
    			}
    			$tok[0] = $sb.join("");
    			$i -= 1;
    			PST$clearList($sb);
    		}
    		$output.push($tok);
    		$i += 1;
    	}
    	return $output;
    };

    let $Fmt_convertStringToTagType = function($ctx, $tag) {
    	switch ($tag.charCodeAt(0)) {
    		case 98:
    			if ($tag == "b") {
    				return 1;
    			}
    			break;
    		case 99:
    			if ($tag == "code") {
    				return 21;
    			}
    			break;
    		case 105:
    			if ($tag == "i") {
    				return 2;
    			}
    			break;
    		case 108:
    			if ($tag == "link") {
    				return 22;
    			}
    			break;
    		case 115:
    			if ($tag == "s") {
    				return 4;
    			}
    			if ($tag == "spoiler" && $ctx[3]) {
    				return 24;
    			}
    			if ($tag == "sub") {
    				return 5;
    			}
    			if ($tag == "sup") {
    				return 6;
    			}
    			break;
    		case 116:
    			if ($tag == "t") {
    				return 23;
    			}
    			break;
    		case 117:
    			if ($tag == "u") {
    				return 3;
    			}
    			break;
    	}
    	if ($ctx[0][$tag] !== undefined) {
    		return $ctx[0][$tag];
    	}
    	return 0;
    };

    let $Fmt_getHttpUrlLength = function($chars, $startIndex) {
    	let $i = $startIndex;
    	if ($chars[$i] != "h" || ($chars[$i + 1] != "t" || ($chars[$i + 2] != "t" || $chars[$i + 3] != "p"))) {
    		return 0;
    	}
    	$i += 4;
    	if ($chars[$i] == "s") {
    		$i += 1;
    	}
    	if ($chars[$i] != ":" || ($chars[$i + 1] != "/" || $chars[$i + 2] != "/")) {
    		return 0;
    	}
    	$i += 3;
    	let $letters = "abcdefghijklmnopqrstuvwxyz";
    	let $validChars = $strToSet([$letters, $letters.toUpperCase(), "/%@#~^:*+$',&?=_-.[]()0123456789"].join(''));
    	let $bracketStack = [];
    	$bracketStack.push("");
    	let $len = $chars.length;
    	let $c = "";
    	while ($i < $len) {
    		$c = $chars[$i];
    		if ($validChars[$c] !== undefined) {
    			if ($c == "[") {
    				$bracketStack.push($c);
    			} else if ($c == "(") {
    				$bracketStack.push($c);
    			} else if ($c == ")") {
    				if ($bracketStack[$bracketStack.length - 1] != "(") {
    					return $i - $startIndex;
    				}
    				$bracketStack.pop();
    			} else if ($c == "]") {
    				if ($bracketStack[$bracketStack.length - 1] != ")") {
    					return $i - $startIndex;
    				}
    				$bracketStack.pop();
    			}
    			$i += 1;
    		} else {
    			return $i - $startIndex;
    		}
    	}
    	return $len - $startIndex;
    };

    let $Fmt_invalidateToken = function($tok, $tagToText) {
    	$tok[1] = 0;
    	if (!$tagToText) {
    		$tok[0] = "";
    	}
    	if ($tok[3] != null) {
    		let $pair = $tok[3];
    		$pair[3] = null;
    		$tok[3] = null;
    		$Fmt_invalidateToken($pair, $tagToText);
    	}
    };

    let $Fmt_isStringNextInCharList = function($chars, $index, $nextChars) {
    	if ($index + $nextChars.length > $chars.length) {
    		return false;
    	}
    	let $i = 0;
    	while ($i < $nextChars.length) {
    		if ($chars[$index + $i].charCodeAt(0) != $nextChars.charCodeAt($i)) {
    			return false;
    		}
    		$i += 1;
    	}
    	return true;
    };

    let $Fmt_parse = function($ctx, $value) {
    	let $tokenList = $Fmt_tokenize($ctx, $value);
    	let $stream = $newFmtTokenStream($ctx, $tokenList);
    	let $rootSiblings = $Fmt_parseSiblings($stream);
    	let $output = $newFmtNodeJoiner($rootSiblings);
    	return $output;
    };

    let $Fmt_parseSiblings = function($stream) {
    	let $output = [];
    	while ($stream[2] < $stream[3]) {
    		let $type = $Fmt_tokenPeekType($stream);
    		let $nextNode = null;
    		switch ($type) {
    			case 1:
    				$nextNode = $Fmt_parseTag($stream);
    				break;
    			case 0:
    				$nextNode = $newFmtNodeText($Fmt_tokenPop($stream)[0]);
    				break;
    			case 4:
    				$nextNode = $newFmtNodeText($Fmt_tokenPop($stream)[0]);
    				$nextNode[0] = 12;
    				break;
    			case 3:
    				let $url = $Fmt_tokenPop($stream)[0];
    				$nextNode = $newFmtNodeUrl($url);
    				if ($stream[5] > 0) {
    					if ($stream[4] == null) {
    						$stream[4] = $url;
    						$nextNode = null;
    					} else {
    						$nextNode = $newFmtNodeText($url);
    					}
    				}
    				break;
    			case 2:
    				return $output;
    			case 5:
    				return $output;
    			default:
    				$fail("");
    				break;
    		}
    		if ($nextNode != null) {
    			$output.push($nextNode);
    		}
    	}
    	return $output;
    };

    let $Fmt_parseTag = function($stream) {
    	let $open = $Fmt_tokenPop($stream);
    	if ($open[1] != 1) {
    		$fail("");
    	}
    	let $tagType = $open[2];
    	if ($tagType == 22) {
    		let $linkNestDepth = $stream[5];
    		if ($linkNestDepth == 0) {
    			$stream[4] = null;
    		}
    		$stream[5] = $linkNestDepth + 1;
    	}
    	let $children = $Fmt_parseSiblings($stream);
    	let $nodeType = 0;
    	let $nodeArg = null;
    	switch ($tagType) {
    		case 1:
    			$nodeType = 1;
    			break;
    		case 2:
    			$nodeType = 2;
    			break;
    		case 3:
    			$nodeType = 3;
    			break;
    		case 4:
    			$nodeType = 4;
    			break;
    		case 6:
    			$nodeType = 6;
    			break;
    		case 5:
    			$nodeType = 5;
    			break;
    		case 24:
    			$nodeType = 9;
    			break;
    		case 22:
    			if ($stream[5] == 1 && $stream[4] != null) {
    				$nodeType = 7;
    				$nodeArg = $stream[4];
    				$stream[4] = null;
    			} else {
    				$nodeType = 0;
    			}
    			$stream[5] = $stream[5] - 1;
    			let $childrenSz = $children.length;
    			if ($childrenSz > 0) {
    				if ($children[0][0] == 0) {
    					$children[0][1] = $children[0][1].trimStart();
    				}
    				if ($children[$childrenSz - 1][0] == 0) {
    					$children[$childrenSz - 1][1] = $children[$childrenSz - 1][1].trimEnd();
    				}
    			} else {
    				$children.push($newFmtNodeText($nodeArg));
    			}
    			break;
    		case 23:
    			$nodeType = 10;
    			$fail("TODO: tile");
    			break;
    		case 21:
    			$fail("");
    			break;
    		default:
    			if ($stream[0][1][$tagType] !== undefined) {
    				$nodeType = 13;
    				$nodeArg = $stream[0][1][$open[2]];
    			}
    			break;
    	}
    	let $close = $Fmt_tokenPop($stream);
    	if ($close != null && ($close[1] != 2 || $close[2] != $open[2])) {
    		$fail("");
    	}
    	let $content = $newFmtNodeJoiner($children);
    	$content[0] = $nodeType;
    	$content[3] = $nodeArg;
    	return $content;
    };

    let $Fmt_removeRedundantTags = function($ctx, $tokens) {
    	let $isBold = false;
    	let $isItalic = false;
    	let $isUnderline = false;
    	let $isStrike = false;
    	let $inLink = false;
    	let $inSpoiler = false;
    	let $subSupDepth = 0;
    	let $colorStack = [];
    	$colorStack.push(-1);
    	let $len = $tokens.length;
    	let $i = 0;
    	while ($i < $len) {
    		let $tok = $tokens[$i];
    		switch ($tok[1]) {
    			case 1:
    				switch ($tok[2]) {
    					case 22:
    						if ($inLink) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$inLink = true;
    						}
    						break;
    					case 1:
    						if ($isBold) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$isBold = true;
    						}
    						break;
    					case 2:
    						if ($isItalic) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$isItalic = true;
    						}
    						break;
    					case 3:
    						if ($isUnderline) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$isUnderline = true;
    						}
    						break;
    					case 4:
    						if ($isStrike) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$isStrike = true;
    						}
    						break;
    					case 5:
    						if ($subSupDepth > 5) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$subSupDepth += 1;
    						}
    						break;
    					case 6:
    						if ($subSupDepth > 5) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$subSupDepth += 1;
    						}
    						break;
    					case 24:
    						if ($inSpoiler) {
    							$Fmt_invalidateToken($tok, false);
    						} else {
    							$inSpoiler = true;
    						}
    						break;
    					default:
    						if ($ctx[1][$tok[2]] !== undefined) {
    							if ($inLink || $colorStack[$colorStack.length - 1] == $tok[2]) {
    								$Fmt_invalidateToken($tok, false);
    							} else {
    								$colorStack.push($tok[2]);
    							}
    						} else {
    							$fail("");
    						}
    						break;
    				}
    				break;
    			case 2:
    				switch ($tok[2]) {
    					case 22:
    						$inLink = false;
    						break;
    					case 1:
    						$isBold = false;
    						break;
    					case 2:
    						$isItalic = false;
    						break;
    					case 3:
    						$isUnderline = false;
    						break;
    					case 4:
    						$isStrike = false;
    						break;
    					case 5:
    						$subSupDepth -= 1;
    						break;
    					case 6:
    						$subSupDepth -= 1;
    						break;
    					case 24:
    						$inSpoiler = false;
    						break;
    					default:
    						if ($ctx[1][$tok[2]] !== undefined) {
    							$colorStack.pop();
    						} else {
    							$fail("");
    						}
    						break;
    				}
    				break;
    		}
    		$i += 1;
    	}
    };

    let $Fmt_splitToChunks = function($value, $linksEnabled) {
    	let $output = [];
    	let $chars = $string_unicodeSplit($value);
    	let $len = $chars.length;
    	let $c = "";
    	let $sb = [];
    	let $i = 0;
    	while ($i < $len) {
    		$c = $chars[$i];
    		if ($c == "<" || ($c == ">" || $c == "/")) {
    			if ($sb.length > 0) {
    				$output.push($sb.join(""));
    				PST$clearList($sb);
    			}
    			if ($c == "<" && $Fmt_isStringNextInCharList($chars, $i, "<code>")) {
    				$sb.push("<code:");
    				let $k = $i + "<code>".length;
    				while ($k < $len) {
    					if ($Fmt_isStringNextInCharList($chars, $k, "</code>")) {
    						$i = $k - 1;
    						$k = $len;
    					} else {
    						$i = $k;
    						$sb.push($chars[$k]);
    					}
    					$k += 1;
    				}
    				$output.push($sb.join(""));
    				PST$clearList($sb);
    				$i += "</code>".length;
    			} else {
    				$output.push($c);
    			}
    		} else if ($c == "h" && ($i + 8 < $len && ($chars[$i + 6] == "/" && $linksEnabled))) {
    			let $urlLen = $Fmt_getHttpUrlLength($chars, $i);
    			if ($urlLen == 0) {
    				$sb.push($c);
    			} else {
    				if ($sb.length > 0) {
    					$output.push($sb.join(""));
    					PST$clearList($sb);
    				}
    				$sb.push("<url:");
    				let $j = 0;
    				while ($j < $urlLen) {
    					$sb.push($chars[$i + $j]);
    					$j += 1;
    				}
    				$output.push($sb.join(""));
    				PST$clearList($sb);
    				$i += $urlLen - 1;
    			}
    		} else {
    			$sb.push($c);
    		}
    		$i += 1;
    	}
    	if ($sb.length > 0) {
    		$output.push($sb.join(""));
    	}
    	return [...($output)];
    };

    let $Fmt_tokenize = function($ctx, $value) {
    	let $chunks = $Fmt_splitToChunks($value, $ctx[7]);
    	let $tokens = [];
    	let $len = $chunks.length;
    	let $tagType = 0;
    	let $isTag = false;
    	let $tok = null;
    	let $i = 0;
    	while ($i < $len) {
    		let $chunk = $chunks[$i];
    		$isTag = false;
    		if ($chunk == "<" && $i + 2 < $len) {
    			if ($chunks[$i + 1] == "/" && ($i + 3 < $len && $chunks[$i + 3] == ">")) {
    				$tagType = $Fmt_convertStringToTagType($ctx, $chunks[$i + 2]);
    				if ($tagType != 0) {
    					$isTag = true;
    					$tokens.push([["</", $chunks[$i + 2], ">"].join(''), 2, $tagType, null]);
    					$i += 3;
    				}
    			} else if ($chunks[$i + 2] == ">") {
    				$tagType = $Fmt_convertStringToTagType($ctx, $chunks[$i + 1]);
    				if ($tagType != 0 && ($tagType != 22 || $ctx[8])) {
    					$isTag = true;
    					$tokens.push([["<", $chunks[$i + 1], ">"].join(''), 1, $tagType, null]);
    					$i += 2;
    				}
    			}
    		}
    		if (!$isTag) {
    			let $tokType = 0;
    			if ($chunk.startsWith("<")) {
    				if ($chunk.startsWith("<url:")) {
    					$tokType = 3;
    					$chunk = $chunk.substring(5, 5 + ($chunk.length - 5));
    				} else if ($chunk.startsWith("<code:")) {
    					$tokType = 4;
    					$chunk = $chunk.substring(6, 6 + ($chunk.length - 6));
    				}
    			}
    			$tokens.push([$chunk, $tokType, 0, null]);
    		}
    		$i += 1;
    	}
    	let $depthCountByTagType = {};
    	let $j = 0;
    	while ($j < $tokens.length) {
    		$tok = $tokens[$j];
    		let $tagDiff = 0;
    		if ($tok[1] == 1) {
    			$tagDiff = 1;
    		} else if ($tok[1] == 2) {
    			$tagDiff = -1;
    		}
    		if ($tagDiff != 0) {
    			let $currentDepth = 0;
    			$tagType = $tok[2];
    			if ($depthCountByTagType[$tagType] !== undefined) {
    				$currentDepth = $depthCountByTagType[$tagType];
    			}
    			let $nextDepth = $currentDepth + $tagDiff;
    			if ($nextDepth == -1 || $nextDepth > 20) {
    				$Fmt_invalidateToken($tok, true);
    			} else {
    				$depthCountByTagType[$tagType] = $nextDepth;
    			}
    		}
    		$j += 1;
    	}
    	let $tagStack = [];
    	let $stackTop = null;
    	let $k = 0;
    	while ($k < $tokens.length) {
    		$tok = $tokens[$k];
    		if ($tok[1] == 1) {
    			$tagStack.push($tok);
    		} else if ($tok[1] == 2) {
    			$stackTop = $tagStack[$tagStack.length - 1];
    			let $isValid = $tagStack.length > 0 && $stackTop[2] == $tok[2];
    			if ($isValid) {
    				$stackTop[3] = $tok;
    				$tok[3] = $stackTop;
    				$tagStack.pop();
    			} else {
    				$Fmt_invalidateToken($tok, true);
    			}
    		}
    		$k += 1;
    	}
    	while ($tagStack.length > 0) {
    		$stackTop = $tagStack.pop();
    		let $closerTag = ["</>", 2, $stackTop[2], $stackTop];
    		$stackTop[3] = $closerTag;
    		$tokens.push($closerTag);
    	}
    	$Fmt_removeRedundantTags($ctx, $tokens);
    	let $output = $Fmt_consolidatePlainTokens($tokens);
    	return [...($output)];
    };

    let $Fmt_tokenPeekType = function($stream) {
    	if ($stream[2] < $stream[3]) {
    		return $stream[1][$stream[2]][1];
    	}
    	return 5;
    };

    let $Fmt_tokenPop = function($stream) {
    	if ($stream[2] >= $stream[3]) {
    		return null;
    	}
    	$stream[2] = $stream[2] + 1;
    	return $stream[1][$stream[2] - 1];
    };

    let $fmtNodeTypeToTokenId = function($type, $arg) {
    	switch ($type) {
    		case 0:
    			return null;
    		case 1:
    			return "bold";
    		case 2:
    			return "italic";
    		case 3:
    			return "underline";
    		case 4:
    			return "strike";
    		case 5:
    			return "sub";
    		case 6:
    			return "sup";
    		case 7:
    			return "link-" + $arg;
    		case 8:
    			return "link-" + $arg;
    		case 12:
    			return "code";
    		case 9:
    			return "spoiler";
    		case 13:
    			return "color-" + $arg;
    		default:
    			$fail("NYI");
    			break;
    	}
    	return "?";
    };

    let $htmlEscape = function($val, $sb) {
    	let $len = $val.length;
    	let $i = 0;
    	while ($i < $len) {
    		let $cc = $val.charCodeAt($i);
    		switch ($cc) {
    			case 60:
    				$sb.push("&lt;");
    				break;
    			case 62:
    				$sb.push("&gt;");
    				break;
    			case 38:
    				$sb.push("&amp;");
    				break;
    			case 34:
    				$sb.push("&quot;");
    				break;
    			default:
    				$sb.push(String.fromCharCode($cc));
    				break;
    		}
    		$i += 1;
    	}
    };

    let $isAlphaNumsOnly = function($val) {
    	let $i = 0;
    	while ($i < $val.length) {
    		let $cc = $val.charCodeAt($i);
    		if ($cc < 97 || $cc > 122 && ($cc < 65 || $cc > 90 && ($cc < 48 || $cc > 57))) {
    			return false;
    		}
    		$i += 1;
    	}
    	return true;
    };

    let $maybeColumnSmartSplit = function($value) {
    	let $trimmed = $value.substring(1, 1 + ($value.length - 2));
    	let $cols = $trimmed.split("|");
    	let $i = 0;
    	while ($i < $cols.length) {
    		if ($cols[$i].endsWith("\\") || $cols[$i].indexOf("`") != -1) {
    			return $finickyColumnSplit($trimmed);
    		}
    		$cols[$i] = $cols[$i].trim();
    		$i += 1;
    	}
    	return $cols;
    };

    let $newChatContext = function() {
    	return $ucpValidate($newUcpContextInformalBlock());
    };

    let $newFailedMarkupToText = function($c, $v) {
    	$CS_pop($c);
    	return $newNodeWithContent(3, $v, 0);
    };

    let $newFmtNodeJoiner = function($children) {
    	return [0, null, [...($children)], null];
    };

    let $newFmtNodeText = function($value) {
    	return [0, $value, null, null];
    };

    let $newFmtNodeUrl = function($url) {
    	return [8, $url, null, $url];
    };

    let $newFmtTokenStream = function($ctx, $tokens) {
    	return [$ctx, $tokens, 0, $tokens.length, null, 0];
    };

    let $newForumContext = function() {
    	let $ctx = $newUcpContextFormalBlock();
    	$ctx[2] = true;
    	return $ucpValidate($ctx);
    };

    let $newNodeWithChildren = function($type, $children, $depth) {
    	let $n = $newNodeWithContent($type, null, $depth);
    	$n[1] = [...($children)];
    	return $n;
    };

    let $newNodeWithContent = function($type, $content, $depth) {
    	return [$type, null, $content, null, $depth, null, null];
    };

    let $newNodeWithFormattedContent = function($content, $depth) {
    	let $n = $newNodeWithContent(3, null, $depth);
    	$n[6] = $content;
    	return $n;
    };

    let $newPollOptionContext = function() {
    	let $ctx = $newUcpContextOneLineSnippet(200);
    	$ctx[3] = false;
    	return $ucpValidate($ctx);
    };

    let $newProfileBioContext = function() {
    	return $ucpValidate($newUcpContextFormalBlock());
    };

    let $newQaAnswerContext = function() {
    	return $ucpValidate($newUcpContextInformalBlock());
    };

    let $newQaQuestionContext = function() {
    	return $ucpValidate($newUcpContextInformalBlock());
    };

    let $newUcpContextDefault = function() {
    	let $colors = $Ctx_newColorSet();
    	let $inv = {};
    	let $keys = Object.keys($colors);
    	let $i = 0;
    	while ($i < $keys.length) {
    		$inv[$colors[$keys[$i]]] = $keys[$i];
    		$i += 1;
    	}
    	return [$colors, $inv, false, true, false, false, false, false, false, false, -1];
    };

    let $newUcpContextFormalBlock = function() {
    	let $ctx = $newUcpContextDefault();
    	$ctx[4] = true;
    	$ctx[5] = true;
    	$ctx[6] = true;
    	$ctx[7] = true;
    	$ctx[8] = true;
    	$ctx[9] = true;
    	return $ctx;
    };

    let $newUcpContextInformalBlock = function() {
    	let $ctx = $newUcpContextDefault();
    	$ctx[4] = true;
    	$ctx[6] = true;
    	$ctx[7] = true;
    	return $ctx;
    };

    let $newUcpContextOneLineSnippet = function($sizeLimit) {
    	let $ctx = $newUcpContextDefault();
    	$ctx[10] = $sizeLimit;
    	$ctx[7] = true;
    	return $ctx;
    };

    let $newVChunk = function($type, $content) {
    	return [$type, $content, -1, null];
    };

    let $newVChunkIntArg = function($type, $content, $arg) {
    	let $c = $newVChunk($type, $content);
    	$c[2] = $arg;
    	return $c;
    };

    let $newVChunkStrArg = function($type, $content, $arg) {
    	let $c = $newVChunk($type, $content);
    	$c[3] = $arg;
    	return $c;
    };

    let $newVStack = function($children, $depth) {
    	return $newNodeWithChildren(0, $children, $depth);
    };

    let $normalizeSpoilerTags = function($chunksIn) {
    	let $chunksOut = [];
    	let $i = 0;
    	while ($i < $chunksIn.length) {
    		let $chunk = $chunksIn[$i];
    		let $asIs = true;
    		if ($chunk[0] == 1 && $chunk[1].indexOf("spoiler>") != -1) {
    			let $spoilerTokens = $splitSpoilerContainingTextToSubTokens($chunk[1]);
    			if ($spoilerTokens.length > 1 || ($spoilerTokens[0] == "<spoiler>" || $spoilerTokens[0] == "</spoiler>")) {
    				$asIs = false;
    				let $j = 0;
    				while ($j < $spoilerTokens.length) {
    					if ($spoilerTokens[$j] == "<spoiler>") {
    						$chunksOut.push($newVChunk(10, ""));
    					} else if ($spoilerTokens[$j] == "</spoiler>") {
    						$chunksOut.push($newVChunk(11, ""));
    					} else {
    						$chunksOut.push($newVChunk(1, $spoilerTokens[$j].trim()));
    					}
    					$j += 1;
    				}
    			}
    		}
    		if ($asIs) {
    			$chunksOut.push($chunk);
    		}
    		$i += 1;
    	}
    	return $chunksOut;
    };

    let $objArr1 = function($a) {
    	let $o = PST$createNewArray(1, null);
    	$o[0] = $a;
    	return $o;
    };

    let $parseImage = function($cs) {
    	let $imgChunk = $CS_pop($cs);
    	let $imgNode = $newNodeWithContent(12, "", 0);
    	$imgNode[3] = $imgChunk[3];
    	return $imgNode;
    };

    let $parseList = function($cs) {
    	let $depth = $CS_peek($cs)[2];
    	let $items = [];
    	while ($CS_peekType($cs) == 4 && $CS_peek($cs)[2] == $depth) {
    		let $liChunk = $CS_pop($cs);
    		let $liNode = $parseTextChunk($cs[0], $liChunk);
    		if ($CS_peekType($cs) == 4 && $CS_peek($cs)[2] > $depth) {
    			let $nestedList = $parseList($cs);
    			let $nestedChildren = [];
    			$nestedChildren.push($liNode);
    			$nestedChildren.push($nestedList);
    			let $outerNode = $newNodeWithChildren(0, $nestedChildren, 0);
    			$liNode = $outerNode;
    		}
    		$items.push($liNode);
    	}
    	let $ul = $newNodeWithChildren(1, $items, $depth);
    	return $ul;
    };

    let $parseNextChunk = function($p) {
    	let $line = $p[1][$p[2]].split("\t").join("    ");
    	let $ltrimmed = $line;
    	if ($line.startsWith(" ")) {
    		$ltrimmed = $line.trimStart();
    	}
    	if ($ltrimmed == "") {
    		$popAndAddChunkToOutput($p, $newVChunk(2, ""));
    		return;
    	}
    	if ($ltrimmed.startsWith(">>>IMAGE:") && $p[0][9]) {
    		let $imgUrl = $ltrimmed.substring(">>>IMAGE:".length, ">>>IMAGE:".length + ($ltrimmed.length - ">>>IMAGE:".length)).trim();
    		let $protocol = $imgUrl.split("://");
    		if ($protocol.length == 2) {
    			if ($protocol[0] == "http") {
    				$protocol[0] = "https";
    			}
    			$imgUrl = $protocol.join("://");
    			$popAndAddChunkToOutput($p, $newVChunkStrArg(12, "", $imgUrl));
    			return;
    		}
    	}
    	if ($ltrimmed.startsWith(">>>QUOTE") && $p[0][2]) {
    		let $quoteValid = false;
    		let $quoteSource = null;
    		if ($ltrimmed.startsWith(">>>QUOTE:")) {
    			$quoteSource = $ltrimmed.substring(">>>QUOTE:".length, ">>>QUOTE:".length + ($ltrimmed.length - ">>>QUOTE:".length)).trim();
    		} else if ($ltrimmed == ">>>QUOTE") {
    			$quoteSource = "";
    		}
    		if ($quoteSource != null) {
    			let $tagEncodedSrc = null;
    			if ($quoteSource.startsWith("@") && $quoteSource.length > 1) {
    				let $userId = $toAlphaNumsOnly($quoteSource);
    				if ($userId != "" && $userId.length <= 30) {
    					$tagEncodedSrc = "u-" + $quoteSource.substring(1, 1 + ($quoteSource.length - 1));
    				}
    			} else {
    				$tagEncodedSrc = "b64-" + PST$bytesToB64(PST$stringToUtf8Bytes($quoteSource));
    			}
    			if ($tagEncodedSrc != null) {
    				$popAndAddChunkToOutput($p, $newVChunkStrArg(8, null, $tagEncodedSrc));
    				return;
    			}
    		}
    	}
    	if ($ltrimmed == "<<<QUOTE" && $p[0][2]) {
    		$popAndAddChunkToOutput($p, $newVChunk(9, ""));
    		return;
    	}
    	if ($line.startsWith("`")) {
    		let $backticks = $countPrefixSize($line, "`");
    		if ($backticks >= 3) {
    			let $codeBlockLangName = $line.substring($backticks, $backticks + ($line.length - $backticks));
    			if ($isAlphaNumsOnly($codeBlockLangName)) {
    				let $endLine = $line.substring(0, 0 + $backticks);
    				let $codeBlockLines = [];
    				let $runToEnd = true;
    				let $i = $p[2] + 1;
    				while ($i < $p[1].length) {
    					if ($p[1][$i] == $endLine) {
    						$p[2] = $i + 1;
    						$runToEnd = false;
    						break;
    					} else {
    						$codeBlockLines.push($p[1][$i]);
    					}
    					$i += 1;
    				}
    				$p[3].push($newVChunkStrArg(3, $codeBlockLines.join("\n").trimEnd(), $codeBlockLangName));
    				if ($runToEnd) {
    					$p[2] = $p[1].length;
    				}
    				return;
    			}
    		}
    	}
    	if ($line.startsWith("!") && ($line.length > 1 && $p[0][5])) {
    		$popAndAddChunkToOutput($p, $newVChunk(7, $line.substring(1, 1 + ($line.length - 1))));
    		return;
    	}
    	if ($line.startsWith("|") && ($line.endsWith("|") && $p[0][6])) {
    		let $cols = $maybeColumnSmartSplit($line);
    		if ($cols != null && $cols.length >= 2) {
    			$p[3].push($newVChunkIntArg(5, "", $cols.length));
    			let $j = 0;
    			while ($j < $cols.length) {
    				$p[3].push($newVChunk(6, $cols[$j]));
    				$j += 1;
    			}
    			$p[2] = $p[2] + 1;
    			return;
    		}
    	}
    	if ($ltrimmed.startsWith("- ")) {
    		$popAndAddChunkToOutput($p, $newVChunkIntArg(4, $ltrimmed.substring(2, 2 + ($ltrimmed.length - 2)).trim(), $line.length - $ltrimmed.length));
    		return;
    	}
    	$popAndAddChunkToOutput($p, $newVChunk(1, $ltrimmed));
    };

    let $parseNode = function($cs) {
    	let $type = $CS_peekType($cs);
    	switch ($type) {
    		case 1:
    			return $parseTextChunk($cs[0], $CS_pop($cs));
    		case 2:
    			$CS_pop($cs);
    			return $newNodeWithContent(3, "", 0);
    		case 3:
    			let $codeBlock = $CS_pop($cs);
    			let $langName = $codeBlock[3];
    			let $codeNode = $newNodeWithContent(8, $codeBlock[1], 0);
    			$codeNode[3] = $langName;
    			return $codeNode;
    		case 5:
    			return $parseTable($cs);
    		case 4:
    			return $parseList($cs);
    		case 8:
    			return $parseTillCloseTag($cs, 10, 9);
    		case 9:
    			return $newFailedMarkupToText($cs, "<<<QUOTE");
    		case 10:
    			return $parseTillCloseTag($cs, 11, 11);
    		case 11:
    			return $newFailedMarkupToText($cs, "</spoiler>");
    		case 7:
    			let $header = $parseTextChunk($cs[0], $CS_pop($cs));
    			$header[0] = 9;
    			return $header;
    		case 12:
    			return $parseImage($cs);
    		default:
    			$fail("Type Err:" + ($type + ''));
    			break;
    	}
    	return null;
    };

    let $parseTable = function($cs) {
    	let $maxWidth = 0;
    	let $rows = [];
    	while ($CS_peekType($cs) == 5) {
    		let $row = $CS_pop($cs);
    		let $cellCount = $row[2];
    		if ($cellCount > $maxWidth) {
    			$maxWidth = $cellCount;
    		}
    		let $cells = [];
    		while ($cellCount > 0) {
    			$cells.push($parseTextChunk($cs[0], $CS_pop($cs)));
    			$cellCount -= 1;
    		}
    		let $rowNode = $newNodeWithChildren(6, $cells, 0);
    		$rows.push($rowNode);
    	}
    	let $columnAlign = null;
    	let $hasHeader = false;
    	if ($rows.length >= 2) {
    		$hasHeader = true;
    		$columnAlign = [];
    		let $i = 0;
    		while ($i < $rows[1][1].length && $hasHeader) {
    			let $formattedContent = $rows[1][1][$i][6];
    			let $strVal = $formattedContent[1];
    			if ($strVal == null) {
    				$strVal = "";
    			}
    			let $tableCellAlign = $convertTextToCellAlignment($strVal);
    			if ($tableCellAlign == 0) {
    				$hasHeader = false;
    			} else {
    				$columnAlign.push($tableCellAlign);
    			}
    			$i += 1;
    		}
    		if (!$hasHeader) {
    			$columnAlign = null;
    		}
    	}
    	let $tableNode = $newNodeWithChildren(5, $rows, 0);
    	if ($hasHeader) {
    		while ($columnAlign.length < $maxWidth) {
    			$columnAlign.push(1);
    		}
    		$tableNode[5] = [...($columnAlign)];
    		$tableNode[1] = $removeSecondItem($tableNode[1]);
    	}
    	return $tableNode;
    };

    let $parseTextChunk = function($ctx, $textChunk) {
    	let $content = $textChunk[1];
    	let $needParsing = $content.indexOf(">") != -1 || ($content.indexOf("@") != -1 || ($content.indexOf("://") != -1 && ($content.indexOf("http://") != -1 || $content.indexOf("https://") != -1)));
    	let $rootNode = null;
    	if ($needParsing) {
    		$rootNode = $Fmt_parse($ctx, $content);
    	} else {
    		$rootNode = $newFmtNodeText($content);
    	}
    	return $newNodeWithFormattedContent($rootNode, 0);
    };

    let $parseTillCloseTag = function($cs, $nodeType, $endTagType) {
    	let $items = [];
    	let $openChunk = $CS_pop($cs);
    	while ($CS_hasMore($cs) && $CS_peekType($cs) != $endTagType) {
    		$items.push($parseNode($cs));
    	}
    	if ($CS_hasMore($cs)) {
    		if ($CS_peekType($cs) != $endTagType) {
    			$fail("");
    		}
    		$CS_pop($cs);
    	}
    	let $node = $newNodeWithChildren($nodeType, $items, 0);
    	$node[3] = $openChunk[3];
    	return $node;
    };

    let $parseToChunks = function($ctx, $originalText) {
    	let $lines = $cleanLineSplit($originalText);
    	if (!$ctx[4]) {
    		let $t = PST$createNewArray(1, null);
    		$t[0] = $lines.join(" ");
    		$lines = $t;
    	}
    	$lines = $performSizeLimitTrimming($lines, $ctx[10]);
    	let $p = [$ctx, $lines, 0, []];
    	while ($p[2] < $p[1].length) {
    		$parseNextChunk($p);
    	}
    	if ($ctx[3]) {
    		$p[3] = $normalizeSpoilerTags($p[3]);
    	}
    	return $p;
    };

    let $parseToHtml = function($ctx, $originalText) {
    	let $tokens = $parseToTokens($ctx, $originalText);
    	let $html = $tokensToHtml($tokens);
    	return $html;
    };

    let $parseToPreview = function($ctx, $originalText, $previewSizeLimit, $includeEllipsis) {
    	let $tokens = $parseToTokens($ctx, $originalText);
    	let $preview = $tokensToPreview($tokens, $previewSizeLimit, $includeEllipsis);
    	return $preview;
    };

    let $parseToTokens = function($ctx, $originalText) {
    	let $fppc = $parseToChunks($ctx, $originalText);
    	let $topVStack = $parseToTree($fppc);
    	let $tokens = $treeToTokens($topVStack);
    	return $tokens;
    };

    let $parseToTree = function($fpCtx) {
    	let $cs = [$fpCtx[0], [...($fpCtx[3])], 0, $fpCtx[3].length];
    	let $topLevelNodes = [];
    	while ($CS_hasMore($cs)) {
    		$topLevelNodes.push($parseNode($cs));
    	}
    	return $newNodeWithChildren(0, $topLevelNodes, 0);
    };

    let $performSizeLimitTrimming = function($lines, $limit) {
    	if ($limit == -1) {
    		return $lines;
    	}
    	let $sizeOverEstimate = -1;
    	let $i = 0;
    	while ($i < $lines.length) {
    		$sizeOverEstimate += $lines[$i].length + 1;
    		$i += 1;
    	}
    	if ($sizeOverEstimate <= $limit) {
    		return $lines;
    	}
    	let $sb = [];
    	let $newLines = [];
    	let $actualSize = 0;
    	$i = 0;
    	while ($i < $lines.length) {
    		let $chars = $string_unicodeSplit($lines[$i]);
    		if ($actualSize + $chars.length <= $limit) {
    			$newLines.push($lines[$i]);
    			$actualSize += $chars.length + 1;
    		} else {
    			let $allocationSize = $limit - $actualSize;
    			let $j = 0;
    			while ($j < $chars.length) {
    				if ($j >= $allocationSize) {
    					$chars[$j] = "";
    				}
    				$j += 1;
    			}
    			$newLines.push($chars.join(""));
    			return [...($newLines)];
    		}
    		$i += 1;
    	}
    	return [...($newLines)];
    };

    let $popAndAddChunkToOutput = function($p, $chunk) {
    	$p[3].push($chunk);
    	$p[2] = $p[2] + 1;
    };

    let $removeSecondItem = function($items) {
    	let $output = PST$createNewArray($items.length - 1, null);
    	$output[0] = $items[0];
    	let $i = 2;
    	while ($i < $items.length) {
    		$output[$i - 1] = $items[$i];
    		$i += 1;
    	}
    	return $output;
    };

    let $serializationRequiresLineBreak = function($node) {
    	switch ($node[0]) {
    		case 4:
    			return true;
    		case 3:
    			return true;
    	}
    	return false;
    };

    let $serializeCodeBlockToTokens = function($node, $buffer) {
    	if ($node[3] != "") {
    		$buffer.push(["<codeblock-", $node[3], ">"].join(''));
    	} else {
    		$buffer.push("<codeblock>");
    	}
    	$buffer.push($node[2]);
    	$buffer.push("</codeblock>");
    };

    let $serializeImageToTokens = function($node, $buffer) {
    	$buffer.push("<image>");
    	$buffer.push($node[3]);
    	$buffer.push("</image>");
    };

    let $serializeListToTokens = function($list, $buffer) {
    	$buffer.push("<ul>");
    	let $i = 0;
    	while ($i < $list[1].length) {
    		let $child = $list[1][$i];
    		$buffer.push("<li>");
    		$serializeNodeToTokens($child, $buffer);
    		$buffer.push("</li>");
    		$i += 1;
    	}
    	$buffer.push("</ul>");
    };

    let $serializeMLineSpoilerToTokens = function($node, $buffer) {
    	$buffer.push("<mspoiler>");
    	$serializeNodeSequenceToTokens($node[1], $buffer);
    	$buffer.push("</mspoiler>");
    };

    let $serializeNodeSequenceToTokens = function($nodes, $buffer) {
    	let $i = 0;
    	while ($i < $nodes.length) {
    		if ($i > 0 && ($serializationRequiresLineBreak($nodes[$i - 1]) && $serializationRequiresLineBreak($nodes[$i]))) {
    			$buffer.push("<br>");
    		}
    		$serializeNodeToTokens($nodes[$i], $buffer);
    		$i += 1;
    	}
    };

    let $serializeNodeToTokens = function($node, $buffer) {
    	switch ($node[0]) {
    		case 0:
    			$serializeVStackToTokens($node, $buffer);
    			break;
    		case 4:
    			break;
    		case 3:
    			$serializeTextToTokens($node, $buffer);
    			break;
    		case 8:
    			$serializeCodeBlockToTokens($node, $buffer);
    			break;
    		case 5:
    			$serializeTableToTokens($node, $buffer);
    			break;
    		case 1:
    			$serializeListToTokens($node, $buffer);
    			break;
    		case 9:
    			$buffer.push("<header>");
    			$serializeTextToTokens($node, $buffer);
    			$buffer.push("</header>");
    			break;
    		case 10:
    			$serializeQuoteToTokens($node, $buffer);
    			break;
    		case 11:
    			$serializeMLineSpoilerToTokens($node, $buffer);
    			break;
    		case 12:
    			$serializeImageToTokens($node, $buffer);
    			break;
    		default:
    			$fail("SERIALIZE:" + ($node[0] + ''));
    			break;
    	}
    };

    let $serializeQuoteToTokens = function($node, $buffer) {
    	if ($node[3] != "") {
    		$buffer.push(["<quote-", $node[3], ">"].join(''));
    	} else {
    		$buffer.push("<quote>");
    	}
    	$serializeNodeSequenceToTokens($node[1], $buffer);
    	$buffer.push("</quote>");
    };

    let $serializeTableToTokens = function($table, $buffer) {
    	$buffer.push("<table>");
    	let $hasHeader = $table[5] != null;
    	let $alignment = $table[5];
    	let $i = 0;
    	while ($i < $table[1].length) {
    		if ($hasHeader && $i == 0) {
    			$buffer.push("<thead>");
    		}
    		if ($hasHeader && $i == 1) {
    			$buffer.push("<tbody>");
    		}
    		$buffer.push("<tr>");
    		let $row = $table[1][$i];
    		let $rowSize = $row[1].length;
    		let $j = 0;
    		while ($j < $row[1].length) {
    			let $align = 1;
    			if ($hasHeader) {
    				$align = $alignment[$j];
    			}
    			switch ($align) {
    				case 1:
    					$buffer.push("<td-l>");
    					break;
    				case 2:
    					$buffer.push("<td-r>");
    					break;
    				case 3:
    					$buffer.push("<td-c>");
    					break;
    			}
    			$serializeTextToTokens($row[1][$j], $buffer);
    			$buffer.push("</td>");
    			$j += 1;
    		}
    		$buffer.push("</tr>");
    		if ($hasHeader && $i == 0) {
    			$buffer.push("</thead>");
    		}
    		$i += 1;
    	}
    	if ($hasHeader && $table[1].length > 1) {
    		$buffer.push("</tbody>");
    	}
    	$buffer.push("</table>");
    };

    let $serializeTextToTokens = function($txt, $buffer) {
    	if ($txt[2] != null) {
    		$addLiteralTextToTokenStream($txt[2], $buffer);
    		return;
    	}
    	let $fmtContent = $txt[6];
    	if ($fmtContent == null) {
    		$fail("What?");
    	}
    	$addFormattedTextToTokens($fmtContent, $buffer);
    };

    let $serializeVStackToTokens = function($vs, $buffer) {
    	$buffer.push("<div>");
    	$serializeNodeSequenceToTokens($vs[1], $buffer);
    	$buffer.push("</div>");
    };

    let $splitSpoilerContainingTextToSubTokens = function($value) {
    	let $prelimParts = $value.split("<spoiler>");
    	let $openCount = $prelimParts.length - 1 >> 1;
    	let $closeCount = 0;
    	let $pass1 = [];
    	let $i = 0;
    	while ($i < $prelimParts.length) {
    		if ($i > 0) {
    			$pass1.push("<spoiler>");
    		}
    		let $nestedParts = $prelimParts[$i].split("</spoiler>");
    		$closeCount = $nestedParts.length - 1 >> 1;
    		let $j = 0;
    		while ($j < $nestedParts.length) {
    			if ($j > 0) {
    				$pass1.push("</spoiler>");
    			}
    			if ($nestedParts[$j] != "") {
    				$pass1.push($nestedParts[$j]);
    			}
    			$j += 1;
    		}
    		$i += 1;
    	}
    	let $status = 0;
    	$i = 0;
    	while ($i < $pass1.length - 1) {
    		let $left = "";
    		if ($i > 0) {
    			$left = $pass1[$i - 1];
    		}
    		let $right = $pass1[$i + 1];
    		if ($left == "<spoiler>" && $right == "</spoiler>") {
    			$pass1[$i - 1] = "";
    			$pass1[$i + 1] = "";
    			$pass1[$i] = ["<spoiler>", $pass1[$i], "</spoiler>"].join('');
    		} else if ($left == "<spoiler>" && $pass1[$i] == "</spoiler>") {
    			$pass1[$i - 1] = "";
    			$pass1[$i] = "<spoiler></spoiler>";
    		}
    		$i += 1;
    	}
    	let $output = [];
    	let $sb = [];
    	$i = 0;
    	while ($i < $pass1.length) {
    		let $token = $pass1[$i];
    		let $isTag = $token == "<spoiler>" || $token == "</spoiler>";
    		if ($isTag) {
    			let $v = $sb.join("");
    			PST$clearList($sb);
    			if ($v != "") {
    				$output.push($v);
    			}
    			$output.push($token);
    		} else {
    			$sb.push($token);
    		}
    		$i += 1;
    	}
    	let $lastValue = $sb.join("");
    	if ($lastValue != "") {
    		$output.push($lastValue);
    	}
    	return [...($output)];
    };

    let $string_unicodeSplit = function($val) {
    	let $buf = PST$stringToUtf8Bytes($val);
    	let $output = [];
    	let $len = $buf.length;
    	let $b2 = PST$createNewArray(2, 0);
    	let $b3 = PST$createNewArray(3, 0);
    	let $b4 = PST$createNewArray(4, 0);
    	let $i = 0;
    	while ($i < $len) {
    		let $c = $buf[$i];
    		if ($c < 128) {
    			$output.push(String.fromCharCode($c));
    		} else if (($c & 224) == 192) {
    			$b2[0] = $buf[$i];
    			$b2[1] = $buf[$i + 1];
    			$output.push(new TextDecoder().decode(new Uint8Array($b2)));
    			$i += 1;
    		} else if (($c & 240) == 224) {
    			$b3[0] = $buf[$i];
    			$b3[1] = $buf[$i + 1];
    			$b3[2] = $buf[$i + 2];
    			$output.push(new TextDecoder().decode(new Uint8Array($b3)));
    			$i += 2;
    		} else if (($c & 248) == 240) {
    			$b4[0] = $buf[$i];
    			$b4[1] = $buf[$i + 1];
    			$b4[2] = $buf[$i + 2];
    			$b4[3] = $buf[$i + 3];
    			$output.push(new TextDecoder().decode(new Uint8Array($b4)));
    			$i += 3;
    		}
    		$i += 1;
    	}
    	return [...($output)];
    };

    let $strToSet = function($s) {
    	let $o = {};
    	let $i = 0;
    	while ($i < $s.length) {
    		$o[String.fromCharCode($s.charCodeAt($i))] = true;
    		$i += 1;
    	}
    	return $o;
    };

    let $toAlphaNumsOnly = function($val) {
    	let $sb = [];
    	let $i = 0;
    	while ($i < $val.length) {
    		let $cc = $val.charCodeAt($i);
    		if ($cc >= 97 && $cc <= 122 || ($cc >= 65 && $cc <= 90 || ($cc >= 48 && $cc <= 57))) {
    			$sb.push(String.fromCharCode($cc));
    		}
    		$i += 1;
    	}
    	return $sb.join("");
    };

    let $tokensToHtml = function($tokens) {
    	let $sb = [];
    	$sb.push("<div class=\"ucp-content\">");
    	let $i = 0;
    	while ($i < $tokens.length) {
    		let $token = $tokens[$i];
    		if ($token.length > 0) {
    			if ($token.charCodeAt(0) == 60) {
    				if ($token == "<image>") {
    					$sb.push("<div class=\"ucp-image\"><img src=\"");
    					$htmlEscape($tokens[$i + 1], $sb);
    					$sb.push("\"></div>");
    					$i += 2;
    				} else {
    					let $tag = $tokenToHtmlTag($token);
    					if ($tag != null) {
    						if ($tag == "<lt-esc>") {
    							$i += 1;
    							$htmlEscape($tokens[$i], $sb);
    						} else if ($token.startsWith("<codeblock")) {
    							$sb.push($tag);
    							$sb.push($codeblockContentToHtml($tokens[$i + 1]));
    							$sb.push("</div>");
    							$i += 2;
    						} else {
    							$sb.push($tag);
    						}
    					} else {
    						$htmlEscape($token, $sb);
    					}
    				}
    			} else {
    				$htmlEscape($token, $sb);
    			}
    		}
    		$i += 1;
    	}
    	$sb.push("</div>");
    	return $sb.join("");
    };

    let $tokensToPreview = function($tokens, $previewSize, $includeEllipsis) {
    	let $inSpoiler = false;
    	let $sbSize = 0;
    	let $i = 0;
    	while ($i < $tokens.length) {
    		let $token = $tokens[$i];
    		if ($inSpoiler) {
    			if ($token == "</spoiler>") {
    				$inSpoiler = false;
    			}
    			$tokens[$i] = "";
    		} else if ($token == "<spoiler>") {
    			$inSpoiler = true;
    			$tokens[$i] = "[SPOILER]";
    		} else if ($token.startsWith("<")) {
    			if ($token == "<br>") {
    				$tokens[$i] = " ";
    			} else {
    				$tokens[$i] = "";
    			}
    			if ($token == "<lt-esc>") {
    				$i += 1;
    			}
    		}
    		$i += 1;
    	}
    	let $output = $tokens.join("").trim();
    	let $sizeOverEstimate = $output.length;
    	if ($sizeOverEstimate < $previewSize) {
    		return $output;
    	}
    	let $substrUpperLimit = ($previewSize + 1) * 4;
    	if ($output.length > $substrUpperLimit) {
    		$output = $output.substring(0, 0 + $substrUpperLimit);
    	}
    	let $chars = $string_unicodeSplit($output);
    	if ($chars.length <= $previewSize) {
    		return $output;
    	}
    	let $sb = [];
    	$i = 0;
    	while ($i < $previewSize) {
    		$sb.push($chars[$i]);
    		$i += 1;
    	}
    	let $sbFlat = $sb.join("").trimEnd();
    	if ($includeEllipsis) {
    		$sbFlat += "...";
    	}
    	return $sbFlat;
    };

    let $tokenToHtmlTag = function($token) {
    	if ($token.length < 3) {
    		return null;
    	}
    	switch ($token.charCodeAt(1)) {
    		case 47:
    			return $tokenToHtmlTagClose($token);
    		case 98:
    			if ($token == "<bold>") {
    				return "<span style=\"font-weight: bold;\">";
    			}
    			break;
    		case 99:
    			if ($token.startsWith("<color-")) {
    				let $colorName = $token.split("-")[1];
    				$colorName = $colorName.substring(0, 0 + ($colorName.length - 1));
    				return ["<span class=\"ucp-color-", $colorName, "\">"].join('');
    			}
    			if ($token == "<code>") {
    				return "<span class=\"ucp-code\">";
    			}
    			if ($token.startsWith("<codeblock")) {
    				let $lang = "unknown";
    				if ($token != "<codeblock>") {
    					$lang = $token.split("-")[1].split(">")[0];
    				}
    				return ["<div class=\"ucp-code-block ucp-code-lang-", $lang, "\">"].join('');
    			}
    			break;
    		case 104:
    			if ($token == "<header>") {
    				return "<div class=\"ucp-header\">";
    			}
    			break;
    		case 105:
    			if ($token == "<italic>") {
    				return "<span style=\"font-style: italic;\">";
    			}
    			break;
    		case 108:
    			if ($token.startsWith("<link-")) {
    				let $url = $token.substring(6, 6 + ($token.length - 7));
    				return ["<a href=\"", $url, "\">"].join('');
    			}
    			break;
    		case 109:
    			if ($token == "<mspoiler>") {
    				return "<div class=\"ucp-mspoiler\"><div class=\"ucp-mspoiler-uninitialized\">";
    			}
    			break;
    		case 113:
    			if ($token.startsWith("<quote-")) {
    				let $quoteSrc = $token.substring("<quote-".length, "<quote-".length + ($token.length - ("<quote-".length + 1)));
    				if ($quoteSrc.startsWith("u-")) {
    					$quoteSrc = $quoteSrc.substring(2, 2 + ($quoteSrc.length - 2));
    					return ["<div class=\"ucp-quote ucp-quote-user\"><div class=\"ucp-quote-user-tile\">", $quoteSrc, "</div><div class=\"ucp-quote-content\">"].join('');
    				}
    				if ($quoteSrc.startsWith("b64-")) {
    					$quoteSrc = new TextDecoder().decode(new Uint8Array(PST$b64ToBytes($quoteSrc.substring(4, 4 + ($quoteSrc.length - 4)))));
    					return ["<div class=\"ucp-quote\"><div class=\"ucp-quote-source\">Quote from <span style=\"font-weight:bold;\">", $escapeHtml($quoteSrc), "</span></div><div class=\"ucp-quote-content\">"].join('');
    				}
    				return "<div class=\"ucp-quote\"><div class=\"ucp-quote-content\">";
    			}
    			if ($token == "<quote>") {
    				return "<div class=\"ucp-quote\"><div class=\"ucp-quote-content\">";
    			}
    			break;
    		case 115:
    			if ($token == "<strike>") {
    				return "<s>";
    			}
    			if ($token == "<spoiler>") {
    				return "<span class=\"ucp-spoiler ucp-spoiler-uninitialized\">";
    			}
    			break;
    		case 116:
    			if ($token.startsWith("<td-")) {
    				let $template = "<td style=\"text-align: @\">";
    				if ($token == "<td-r>") {
    					return $template.split("@").join("right");
    				}
    				if ($token == "<td-c>") {
    					return $template.split("@").join("center");
    				}
    				return "<td>";
    			}
    			if ($token == "<table>") {
    				return "<div><table>";
    			}
    			break;
    		case 117:
    			if ($token == "<underline>") {
    				return "<span style=\"text-decoration: underline;\">";
    			}
    			break;
    	}
    	return $token;
    };

    let $tokenToHtmlTagClose = function($token) {
    	switch ($token.charCodeAt(2)) {
    		case 98:
    			if ($token == "</bold>") {
    				return "</span>";
    			}
    			break;
    		case 99:
    			if ($token == "</color>") {
    				return "</span>";
    			}
    			if ($token == "</code>") {
    				return "</span>";
    			}
    			if ($token == "</codeblock>") {
    				return "</div>";
    			}
    			break;
    		case 104:
    			if ($token == "</header>") {
    				return "</div>";
    			}
    			break;
    		case 105:
    			if ($token == "</italic>") {
    				return "</span>";
    			}
    			break;
    		case 108:
    			if ($token == "</link>") {
    				return "</a>";
    			}
    			break;
    		case 109:
    			if ($token == "</mspoiler>") {
    				return "</div></div>";
    			}
    			break;
    		case 113:
    			if ($token == "</quote>") {
    				return "</div></div>";
    			}
    			break;
    		case 115:
    			if ($token == "</strike>") {
    				return "</s>";
    			}
    			if ($token == "</spoiler>") {
    				return "</span>";
    			}
    			break;
    		case 116:
    			if ($token == "</table>") {
    				return "</table></div>";
    			}
    			break;
    		case 117:
    			if ($token == "</underline>") {
    				return "</span>";
    			}
    			break;
    	}
    	return $token;
    };

    let $treeToTokens = function($topNode) {
    	let $tokensOut = [];
    	$serializeNodeToTokens($topNode, $tokensOut);
    	return [...($tokensOut)];
    };

    let $ucpValidate = function($c) {
    	if ($c[8] && !$c[7]) {
    		$fail("");
    	}
    	return $c;
    };
    return [PST$registerExtensibleCallback, $addFormattedTextToTokens, $addLiteralTextToTokenStream, $cleanLineSplit, $codeblockContentToHtml, $convertTextToCellAlignment, $countPrefixSize, $CS_hasMore, $CS_isNext, $CS_peek, $CS_peekType, $CS_pop, $Ctx_newColorSet, $escapeHtml, $fail, $finickyColumnSplit, $Fmt_consolidatePlainTokens, $Fmt_convertStringToTagType, $Fmt_getHttpUrlLength, $Fmt_invalidateToken, $Fmt_isStringNextInCharList, $Fmt_parse, $Fmt_parseSiblings, $Fmt_parseTag, $Fmt_removeRedundantTags, $Fmt_splitToChunks, $Fmt_tokenize, $Fmt_tokenPeekType, $Fmt_tokenPop, $fmtNodeTypeToTokenId, $htmlEscape, $isAlphaNumsOnly, $maybeColumnSmartSplit, $newChatContext, $newFailedMarkupToText, $newFmtNodeJoiner, $newFmtNodeText, $newFmtNodeUrl, $newFmtTokenStream, $newForumContext, $newNodeWithChildren, $newNodeWithContent, $newNodeWithFormattedContent, $newPollOptionContext, $newProfileBioContext, $newQaAnswerContext, $newQaQuestionContext, $newUcpContextDefault, $newUcpContextFormalBlock, $newUcpContextInformalBlock, $newUcpContextOneLineSnippet, $newVChunk, $newVChunkIntArg, $newVChunkStrArg, $newVStack, $normalizeSpoilerTags, $objArr1, $parseImage, $parseList, $parseNextChunk, $parseNode, $parseTable, $parseTextChunk, $parseTillCloseTag, $parseToChunks, $parseToHtml, $parseToPreview, $parseToTokens, $parseToTree, $performSizeLimitTrimming, $popAndAddChunkToOutput, $removeSecondItem, $serializationRequiresLineBreak, $serializeCodeBlockToTokens, $serializeImageToTokens, $serializeListToTokens, $serializeMLineSpoilerToTokens, $serializeNodeSequenceToTokens, $serializeNodeToTokens, $serializeQuoteToTokens, $serializeTableToTokens, $serializeTextToTokens, $serializeVStackToTokens, $splitSpoilerContainingTextToSubTokens, $string_unicodeSplit, $strToSet, $toAlphaNumsOnly, $tokensToHtml, $tokensToPreview, $tokenToHtmlTag, $tokenToHtmlTagClose, $treeToTokens, $ucpValidate];
    })();


            PASTEL_regCallback('fail', args => {
                let msg = `${args[0]}`;
                throw new Error(msg);
            });

            return {
                parseToHtml,
                parseToTokens,
                contexts: {
                    PROFILE: newProfileBioContext(),
                    FORUM: newForumContext(),
                    CHAT: newChatContext(),
                    QA_QUESTION: newQaQuestionContext(),
                    QA_ANSWER: newQaAnswerContext(),
                    QA_POLL: newPollOptionContext(),
                },
            };
        })();

        let getParser = (() => {
            let cache = {};
            return ctxId => {
                if (!cache[ctxId]) cache[ctxId] = getParserImpl(ctxId);
                return cache[ctxId];
            };
        })();

        let getParserImpl = ctxId => {
            let ctx = PST.contexts[ctxId];
            if (!ctx) throw new Error();
            return Object.freeze({
                parseToHtml: text => PST.parseToHtml(ctx, text),
                parseToTokens: text => PST.parseToTokens(ctx, text),
            });
        };
  return { getParser };
})();

export type UcpContext = "PROFILE" | "FORUM" | "CHAT" | "QA_QUESTION" | "QA_ANSWER" | "QA_POLL";

export function parseUcpHtml(text: string, ctx: UcpContext = "FORUM"): string {
	return UCP.getParser(ctx).parseToHtml(text ?? "");
}
