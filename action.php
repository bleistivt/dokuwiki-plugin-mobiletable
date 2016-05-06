<?php

class action_plugin_mobiletable extends DokuWiki_Action_Plugin {

    function __construct() {
        $this->token = '~%'.uniqid().'%~';
    }


	function register(Doku_Event_Handler $controller) {
		$controller->register_hook(
            'PARSER_WIKITEXT_PREPROCESS',
            'BEFORE',
            $this,
            'transform'
        );
	}


	// Find all tables to rewrite.
	function transform(&$event, $param) {
        // Find all tables marked with "!".
        $event->data = preg_replace_callback(
            '/^!(\^.+)\r?\n((?:^[\|\^].+\r?\n)+)/m',
            [$this, 'rearrange'],
            $event->data
        );
    }


    // Rearrange tables
    private function rearrange($m) {
        list($schema, $i) = $this->schema($this->mask($m[1]));
        $table = $this->table($schema, $i, $this->mask($m[2]));
        // Put everything together.
        return "<only mobile>\n"
            .$this->unmask($table)
            ."\n</only>\n<only desktop>\n"
            .str_replace('^!', '^', $m[1])."\n".$m[2]
            ."\n</only>\n";
    }


    // Extract the table schema.
    private function schema($row) {
        $schema = [];
        $index = -1;
        $last = '';
        foreach(explode('^', substr(trim($row), 1, -1)) as $th) {
            // Check for the index column
            if (substr($th, 0, 1) == '!') {
                $index = count($schema);
                $th = substr($th, 1);
            }
            // If non-empty, add to the schema, else take the previous item.
            $schema[] = $last = trim($th) ?: $last;
        }
        return [$schema, $index];
    }


    // Build the mobile table.
    private function table($schema, $index, $body) {
        $table = '';
        $length = count($schema);
        foreach(explode("\n", $body) as $line) {
            if (substr_count($line, '^') == $length + 1) {
                // A random header row appeared!
                $table .= '^'.str_replace('^', '', $line)."^^\n";
                continue;
            }
            // A row with only connected cells.
            if (preg_match('/^\|[\|\s:]*?([^\|]*)[\|\s:]*\|$/', $line, $text)) {
                $table .= "|{$text[1]}||\n";
                continue;
            }
            $row = preg_split('/\||\^/', substr($line, 1, -1));
            // An actual row.
            if ($index > -1 && isset($row[$index])) {
                $table .= '^'.$row[$index]."^^\n";
            }
            for ($i = 0; $i < $length; $i++) {
                if ($i != $index) {
                    $row[$i] = $row[$i] === '' ? ' ' : $row[$i];
                    $table .= "|{$schema[$i]}|{$row[$i]}|\n";
                }
            }
        }
        return $table;
    }


    // Mask "|" characters in images and links.
    private function mask($str) {
        $str = str_replace("\r", '', trim($str, "\n"));
        // Remove anchors.
        $str = preg_replace('/\{\{#:.*?\}\}/', '', $str);
        // Remove footnotes.
        $str = preg_replace('/\(\(.*?\)\)/', '', $str);
        $mask = '$1'.$this->token.'$2';
        // images
        $str = preg_replace('/(\{\{[^\}]+)\|([^\|\}]*?\}\})/', $mask, $str);
        // links
        $str = preg_replace('/(\[\[[^\]]+)\|([^\|\]]*?\]\])/', $mask, $str);
        return $str;
    }


    // Unmask "|" characters.
    private function unmask($str) {
        return str_replace($this->token, '|', $str);
    }

}
