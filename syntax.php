<?php

class syntax_plugin_mobiletable extends DokuWiki_Syntax_Plugin {

    function getType() {
        return 'formatting';
    }

    function getAllowedTypes() {
        return ['container', 'formatting', 'substition', 'protected', 'disabled', 'paragraphs'];
    }

    function getPType() {
        return 'stack';
    }

    function getSort() {
        return 167;
    }

    function connectTo($mode){
        $this->Lexer->addEntryPattern('<mobiletable(?: [0-9]+)?>(?=.*?</mobiletable>)', $mode, 'plugin_mobiletable');
    }

    function postConnect(){
        $this->Lexer->addExitPattern('<\/mobiletable>', 'plugin_mobiletable');
    }

    function handle($match, $state, $pos, Doku_Handler $handler) {
        if ($state == DOKU_LEXER_ENTER) {
            preg_match('/<mobiletable ([0-9]+)?>/i', $match, $parts);
            return '<div class="mobiletable" data-column="'.(isset($parts[1]) && $parts[1] > 0 ? $parts[1] - 1 : '-1').'">';
        } elseif ($state == DOKU_LEXER_EXIT) {
            return '</div>';
        }
    }

    function render($mode, Doku_Renderer $renderer, $data) {
        if ($mode == 'xhtml') {
            $renderer->doc .= $data;
        }
        return true;
    }

}
