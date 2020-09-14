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
<mobiletable 1>
^ Name   ^ Color ^ Size  ^ Speed   ^
^ Item 1   | Red   | Small | 50 km/h |
^ Item 2   | Green | Large | 30 km/h |
</mobiletable>
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

## Syntax

To activate mobile tables, wrap it in `<mobiletable>...</mobiletable>` syntax:

```
<mobiletable>
^ Name   ^ Color ^ Size  ^ Speed   ^
^ Item 1  | Red   | Small | 50 km/h |
^ Item 2  | Green | Large | 30 km/h |
</mobiletable>
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

You may specify the index (starting with 1) of the column you want to make the main/index column.
Using the first example again, your could also make the _Color_ column the main column:

```
<mobiletable 2>
^ Name   ^ Color ^ Size  ^ Speed   ^
^ Item 1  | Red    | Small | 50 km/h |
^ Item 2  | Green  | Large | 30 km/h |
</mobiletable>
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

Note that the previous example could also be expressed using the ''!''-syntax for backwards compatibility:

```
!^ Name   ^! Color ^ Size  ^ Speed   ^
...
```

However, this syntax is not recommended anymore as it breaks section editing.
