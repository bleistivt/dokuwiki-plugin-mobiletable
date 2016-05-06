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
        $this->Lexer->addEntryPattern('<only (?:mobile|desktop)>(?=.*?</only>)', $mode, 'plugin_mobiletable');
    }

    function postConnect(){
        $this->Lexer->addExitPattern('<\/only>', 'plugin_mobiletable');
    }

    function handle($match, $state, $pos, Doku_Handler $handler) {
        if ($state == DOKU_LEXER_ENTER) {
            return '<div class="mobiletable '.substr($match, 6, -1).'only">';
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
