# dokuwiki-plugin-mobiletable

https://www.dokuwiki.org/plugin:mobiletable

This plugin creates a second representation of a table, where all columns are stacked on top of each other, which is only shown for mobile devices.
This improves the mobile experience for wide tables as it prevents horizontal scrolling.

In the mobile presentation (specified by your theme's `__phone_width__`) this:

<table>
    <tr>
        <th> Name </th><th> Color </th><th> Size </th><th> Speed </th>
    </tr>
    <tr>
        <th> Item 1 </th><td> Red </td><td> Small </td><td> 50 km/h </td>
    </tr>
    <tr>
        <th> Item 2 </th><td> Green </td><td> Large </td><td> 30 km/h </td>
    </tr>
</table>

```
!^! Name   ^ Color ^ Size  ^ Speed   ^
^ Item 1   | Red   | Small | 50 km/h |
^ Item 2   | Green | Large | 30 km/h |
```

...becomes this:

<table>
    <tr>
        <th colspan="2"> Item 1 </th>
    </tr>
    <tr>
        <td> Color </td><td> Red </td>
    </tr>
    <tr>
        <td> Size </td><td> Small </td>
    </tr>
    <tr>
        <td> Speed </td><td> 50 km/h </td>
    </tr>
    <tr>
        <th colspan="2"> Item 2 </th>
    </tr>
    <tr>
        <td> Color </td><td> Green </td>
    </tr>
    <tr>
        <td> Size </td><td> Large </td>
    </tr>
    <tr>
        <td> Speed </td><td> 30 km/h </td>
    </tr>
</table>

===== Syntax =====

To activate mobile tables, add ''!'' in front of a table's head row:

```
!^ Name   ^ Color ^ Size  ^ Speed   ^
^ Item 1  | Red   | Small | 50 km/h |
^ Item 2  | Green | Large | 30 km/h |
```

This would create a mobile table like this:

<table>
    <tr>
        <td> Name </td><td> Item 1 </td>
    </tr>
    <tr>
        <td> Color </td><td> Red </td>
    </tr>
    <tr>
        <td> Size </td><td> Small </td>
    </tr>
    <tr>
        <td> Speed </td><td> 50 km/h </td>
    </tr>
    <tr>
        <td> Name </td><td> Item 2 </td>
    </tr>
    <tr>
        <td> Color </td><td> Green </td>
    </tr>
    <tr>
        <td> Size </td><td> Large </td>
    </tr>
    <tr>
        <td> Speed </td><td> 30 km/h </td>
    </tr>
</table>

Use a second `!` as the first character of the cell that you want to make the main/index column.
Using the first example again, your could also make the _Color_ column the main column:

```
!^ Name   ^! Color ^ Size  ^ Speed   ^
^ Item 1  | Red    | Small | 50 km/h |
^ Item 2  | Green  | Large | 30 km/h |
```

<table>
    <tr>
        <th colspan="2"> Red </th>
    </tr>
    <tr>
        <td> Name </td><td> Item 1 </td>
    </tr>
    <tr>
        <td> Size </td><td> Small </td>
    </tr>
    <tr>
        <td> Speed </td><td> 50 km/h </td>
    </tr>
    <tr>
        <th colspan="2"> Green </th>
    </tr>
    <tr>
        <td> Name </td><td> Item 2 </td>
    </tr>
    <tr>
        <td> Size </td><td> Large </td>
    </tr>
    <tr>
        <td> Speed </td><td> 30 km/h </td>
    </tr>
</table>


Additionally this plugin provides `<only desktop></only>` and `<only mobile></only>` markup (which it also uses internally) that can be used to hide content from one or the other.
